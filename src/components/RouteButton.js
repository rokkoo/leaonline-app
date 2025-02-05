import React from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Button, Icon } from 'react-native-elements'
import { TTSengine } from '../components/Tts'
import Colors from '../constants/Colors'
import { useTranslation } from 'react-i18next'

/**
 * @private
 */
const Tts = TTSengine.component()

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'row'
  },
  buttonTitle: {
    color: Colors.primary,
    padding: 30,
    width: '75%'
  },
  button: {
    paddingTop: 5
  },
  iconNavigation: {
  }
})

/**
 * RouteButton contains an icon and a button and a handler for the routing.
 * It renders with default styles.
 *
 * @category Components
 * @param {string} props.title: The displayed and spoken title
 * @param {string} props.icon: The icon for the button
 * @param {function} props.handleScreen The screen to be navigated
 * @param {boolean} props.onlyIcon Determine whether only one icon is displayed (Default 'false')
 * @param {string} props.iconColor The icon color. Default: Colors.gray (examples in ./constants/Colors.js)
 * @param {string} props.color The overall color. Default: Colors.primary (examples in ./constants/Colors.js)
 * @param {boolean} props.waitForSpeech It throws an alert that tts is still speaking and prevents the navigation, if false the tts is stopped (Default 'false')
 * @component
 * @returns {JSX.Element}
 */
const RouteButton = props => {
  const color = props.color || Colors.primary
  const { t } = useTranslation()

  const navigationHandler = () => {
    if (props.waitForSpeech) {
      TTSengine.isSpeaking
        ? Alert.alert(t('alert.title'), t('alert.navText'))
        : props.handleScreen()
    } else {
      TTSengine.stop()
      props.handleScreen()
    }
  }

  /**
   * Only displays the icon if "onlyIcon" is true.
   */
  const renderRouteButton = () => {
    const titleStyle = { ...styles.buttonTitle, ...{ color }, fontFamily: 'semicolon' }
    const buttonStyle = { borderRadius: 15, paddingTop: 10, color, borderColor: color, fontFamily: 'semicolon' }

    if (props.style) {
      Object.assign(buttonStyle, props.style)
    }

    const containerStyle = {
      backgroundColor: 'white',
      borderRadius: 15,
      borderColor: '#fff',
      // dropshadow - ios only
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 1,
      // dropshadow - android only
      elevation: 0.5
    }

    const renderTtsButton = () => {
      return props.noTts
        ? null
        : (<Tts text={props.title} id={`${props.title}-tts`} dontShowText color={color} />)
    }

    if (!props.onlyIcon) {
      return (
        <View style={styles.body}>
          {renderTtsButton()}
          <View style={styles.button}>
            <Button
              icon={<Icon type='font-awesome-5' name={props.icon} size={25} color={props.iconColor || color} />}
              title={props.title}
              titleStyle={titleStyle}
              buttonStyle={buttonStyle}
              containerStyle={containerStyle}
              type='clear' onPress={props.handleScreen}
            />
          </View>
        </View>
      )
    } else {
      return (
        <TouchableOpacity onPress={navigationHandler}>
          <Icon style={props.style || styles.iconNavigation} name={props.icon} color={props.iconColor || Colors.gray} type='font-awesome-5' size={35} />
        </TouchableOpacity>
      )
    }
  }

  return (
    <View style={props.onlyIcon ? '' : styles.body}>
      {renderRouteButton()}
    </View>
  )
}

export default RouteButton
