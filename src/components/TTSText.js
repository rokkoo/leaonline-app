import React from 'react'
import { createStyleSheet } from '../styles/createStyleSheet'
import LeaText from './LeaText'

const styles = createStyleSheet({
  default: {}
})

/**
 * TTSText is a component of Tts. It displays the spoken text.
 *
 * @category Components
 * @param {string} props.text: The displayed text
 * @param {StyleSheet} props.style: The style elements for the text
 * @returns {JSX.Element}
 * @constructor
 */
const TTSText = props => <LeaText style={{ ...styles.default, ...(props.style) }}>{props.text}</LeaText>

export default TTSText
