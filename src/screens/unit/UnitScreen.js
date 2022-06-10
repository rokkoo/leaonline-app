import React, { useState, useEffect, useRef } from 'react'
import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard
} from 'react-native'
import { Log } from '../../infrastructure/Log'
import { Layout } from '../../constants/Layout'
import { UnitContentElementFactory } from '../../components/factories/UnitContentElementFactory'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { loadDocs } from '../../meteor/loadDocs'
import { loadUnitData } from './loadUnitData'
import { Loading } from '../../components/Loading'
import { ActionButton } from '../../components/ActionButton'
import { useTranslation } from 'react-i18next'
import { completeUnit } from './completeUnit'
import { getScoring } from '../../scoring/getScoring'
import { Navbar } from '../../components/Navbar'
import './registerComponents'
import Colors from '../../constants/Colors'
import { ProfileButton } from '../../components/ProfileButton'
import { Confirm } from '../../components/Confirm'
import { getDimensionColor } from './getDimensionColor'
import { Config } from '../../env/Config'
import { shouldRenderStory } from './shouldRenderStory'
import { sendResponse } from './sebdResponse'

/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: Layout.containter(),
  body: {
    flex: 2,
    flexDirection: 'row'
  },
  scrollView: {
    marginHorizontal: 20,
    width: '100%'
  },
  safeAreaView: {
    flex: 1,
    width: '100%',
    alignItems: 'center'
  },
  elements: {
    alignItems: 'center',
    flex: 1
  },
  navigationButtons: {
    flexDirection: 'row'
  },
  routeButtonContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center'
  },
  unitCard: {
    width: '90%',
    marginRight: 40,
    marginLeft: 40,
    marginTop: 10,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: '#fff',
    // dropshadow - ios only
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    // dropshadow - android only
    elevation: 0.5
  }
})

const log = Log.create('UnitScreen')

/**
 * On this screen, the respective Unit is displayed and the users can interact
 * with it, by solving the tasks on its pages.
 *
 * If a unit is completed and there is no next unit in the queue, it navigates
 * the users to the {CompleteScreen}.
 *
 * If a next unit exists, it will load this next unit.
 *
 * On cancel, it navigates users back to the {MapScreen}.
 *
 * @category Screens
 * @component
 * @param props {object}
 * @param props.navigation {object} navigation API
 * @returns {JSX.Element}
 */
const UnitScreen = props => {
  useEffect(() => {
    const didShowSub = Keyboard.addListener('keyboardDidShow', keyboardDidShow)
    const didHideSub = Keyboard.addListener('keyboardDidHide', keyboardDidHide)

    // cleanup function
    return () => {
      didShowSub.remove()
      didHideSub.remove()
    }
  }, [])

  const [keyboardStatus, setKeyboardStatus] = useState(undefined)
  const keyboardDidShow = () => setKeyboardStatus('shown')
  const keyboardDidHide = () => setKeyboardStatus('hidden')

  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const responseRef = useRef({})
  const [scored, setScored] = useState()
  const docs = loadDocs(loadUnitData)

  // ---------------------------------------------------------------------------
  // Prevent backwards functionality
  // ---------------------------------------------------------------------------
  // hitting the back-button should only be executed, when the modal has been
  // confirmed. Otherwise we first trigger the modal.
  useEffect(() => {
    props.navigation.addListener('beforeRemove', (e) => {
      // GO_BACK is the action type from the device's back button
      // where we launch the modal and prevent the event from firing
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault()
        // trigger modal
      }
    })
  }, [props.navigation])

  // ---------------------------------------------------------------------------
  // skip early until docs are fully loaded
  // ---------------------------------------------------------------------------

  if (!docs || docs.loading) {
    return (<Loading />)
  }

  if (docs.data === null) {
    props.navigation.navigate('Map')
    return null
  }

  const { unitSetDoc, unitDoc, sessionDoc } = docs.data
  const showCorrectResponse = scored === page
  const dimensionColor = getDimensionColor(unitSetDoc.dimension)

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------

  /**
   * If users attempt to cancel we surely first show a modal
   * and ask if cancelling was intended.
   * This method is called, when users have approved to cancel
   * @return {Promise<void>}
   */
  const cancelUnit = async () => {
    // todo send cancel information silently to server

    const state = props.navigation.getState()
    const dimensionRoute = state.routes.find(r => r.name === 'Dimension')

    if (!dimensionRoute) {
      props.navigation.navigate('Dimension')
    } else {
      props.navigation.navigate({ key: dimensionRoute.key })
    }
  }

  /**
   * Completes the unit and awaits the server response.
   * Based on the returned route it either cycles into the next unit
   * or navigates to the resulting route (usually complete screen).
   */
  const finish = async () => {
    const nextUnitId = await completeUnit({ unitSetDoc, sessionDoc, unitDoc })

    return nextUnitId
      ? props.navigation.push('Unit')
      : props.navigation.navigate('Complete')
  }

  // ---------------------------------------------------------------------------
  // RENDERING
  // ---------------------------------------------------------------------------

  /**
   *  This is the generic content rendering method, which
   *  applies to all content structure across units and unitSets
   *  with their story pages.
   *  Rendering of the elements is delegated to their respective
   *  registered renderer using the {UnitContentElementFactory}
   **/
  const renderContent = (list) => {
    if (!list?.length) { return null }

    return list.map((element, index) => {
      const elementData = { ...element }
      elementData.dimensionColor = dimensionColor

      // item elements are "interactive" beyond tts
      // and require their own view and handlers
      if (element.type === 'item') {
        elementData.submitResponse = submitResponse
        elementData.showCorrectResponse = showCorrectResponse

        return (
          <KeyboardAvoidingView
            key={index}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <UnitContentElementFactory.Renderer {...elementData} />
          </KeyboardAvoidingView>
        )
      }

      // all other elements are simply "display" elements
      return (
        <View key={index} style={styles.unitCard}>
          <UnitContentElementFactory.Renderer key={index} {...elementData} />
        </View>
      )
    })
  }

  /**
   * Renders the shortCode of the current unit or unitSet if
   * Config.debug.unit is true.
   */
  const renderDebugTitle = () => {
    if (!Config.debug.unit) {
      return null
    }
    const title = unitDoc
      ? unitDoc.shortCode
      : unitSetDoc.shortCode
    return (<Text>{title}</Text>)
  }

  /**
   * Renders the navbar.
   */
  const renderNavBar = () => {
    return (
      <Navbar>
        <Confirm
          id='unit-screen-confirm'
          question={t('unitScreen.abort.question')}
          approveText={t('unitScreen.abort.abort')}
          denyText={t('unitScreen.abort.continue')}
          onApprove={() => cancelUnit()}
          icon='times'
          tts={false}
          style={{
            borderRadius: 2,
            borderWidth: 1,
            borderColor: Colors.dark
          }}
        />
        {renderDebugTitle()}
        <ProfileButton onPress={() => props.navigation.navigate('Profile')} />
      </Navbar>
    )
  }

  // ---------------------------------------------------------------------------
  // STORY DISPLAY
  // ---------------------------------------------------------------------------

  // if this is the very beginning of this unit set AND
  // we have a story to render, let's do it right now

  if (shouldRenderStory({ sessionDoc, unitSetDoc })) {
    log('render story', unitSetDoc.shortCode)
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeAreaView}>
          <ScrollView style={styles.scrollView}>
            {renderNavBar()}
            <View style={styles.elements}>
              {renderContent(unitSetDoc.story)}
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* -------- continue button ---------  */}
        <View style={styles.navigationButtons}>
          <ActionButton
            tts={t('unitScreen.story.continue')}
            color={dimensionColor} onPress={finish}
          />
        </View>
      </View>
    )
  }

  // ---------------------------------------------------------------------------
  // TASK DISPLAY
  // ---------------------------------------------------------------------------
  log('render unit', unitDoc._id, unitDoc.shortCode, 'page', page, 'checked', scored)

  const submitResponse = async ({ responses, data }) => {
    log('item submit', data.contentId, responses)
    responseRef.current[page] = { responses, data }
  }

  const checkScore = async () => {
    // get scoring method
    const currentResponse = responseRef.current[page]
    log({ currentResponse })

    if (!currentResponse || !currentResponse.data || !currentResponse.responses) {
      throw new Error('Response always needs to exist')
    }

    const { responses, data } = currentResponse
    const { type, subtype, value } = data
    const { scoring } = value
    const scoreResult = await getScoring({
      type,
      subtype,
      scoring
    }, { responses })
    log('score', type, subtype, scoreResult.score)

    // submit everything (in the background)
    const responseDoc = {}
    responseDoc.sessionId = sessionDoc._id
    responseDoc.unitSetId = unitSetDoc._id
    responseDoc.unitId = unitDoc._id
    responseDoc.dimensionId = unitSetDoc.dimension
    responseDoc.page = page
    responseDoc.itemId = data.contentId
    responseDoc.itemType = data.subtype
    responseDoc.scores = scoreResult

    log('submit response to server', responseDoc)
    await sendResponse({ responseDoc })

    // update state
    setScored(page)
  }

  const nextPage = () => setPage(page + 1)

  const renderFooter = () => {
    if (keyboardStatus === 'shown') {
      return null
    }
    return (
      <View style={styles.navigationButtons}>
        {renderTaskPageAction()}
      </View>
    )
  }

  const renderTaskPageAction = () => {
    // if the page has not been checked yet we render a check-action button
    if (!showCorrectResponse) {
      log('render check button')
      return (
        <ActionButton
          tts={t('unitScreen.actions.check')} color={dimensionColor}
          onPress={checkScore}
        />
      )
    }

    // if this page has been scored, we can display a "continue" button
    // which either moves to the next page or completes the unit

    const hasNextPage = page < unitDoc.pages.length - 1

    if (hasNextPage) {
      log('render next page button')
      return (
        <ActionButton
          tts={t('unitScreen.actions.next')} color={dimensionColor}
          onPress={nextPage}
        />
      )
    }

    log('render complete unit button')
    return (
      <ActionButton
        tts={t('unitScreen.actions.complete')}
        color={dimensionColor} onPress={finish}
      />
    )
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaView}>
        {renderNavBar()}
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps='always'
        >

          {/* 1. PART STIMULI */}
          <View style={styles.elements}>
            {renderContent(unitDoc.stimuli)}
          </View>

          {/* 2. PART INSTRUCTIONS */}
          <View style={styles.elements}>
            {renderContent(unitDoc.instructions)}
          </View>

          {/* 3. PART TASK */}
          <View style={styles.elements}>
            {renderContent(unitDoc.pages[page].instructions)}
          </View>

          <View style={styles.elements}>
            <Text>{page + 1} / {unitDoc.pages.length}</Text>
          </View>

          {/* 3. PART TASK */}
          <View style={styles.elements}>
            {renderContent(unitDoc.pages[page].content)}
          </View>

        </ScrollView>
      </SafeAreaView>
      {/* -------- continue button ---------  */}
      {renderFooter()}
    </View>
  )
}

export default UnitScreen
