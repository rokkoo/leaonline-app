import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    alert: {
      title: 'Stop',
      navText: 'Please wait until the end of the recording or end it prematurely',
      checkBox: 'You must accept the terms and conditions to continue'
    },
    welcomeScreen: {
      text: 'Welcome to lea online'
    },
    registrationScreen: {
      headerTitle: 'Registration'
    },
    TandCScreen: {
      headerTitle: 'General terms and conditions',
      text: 'I hereby agree to the following conditions ...',
      checkBoxText: 'I have read and agree to the general terms and conditions'
    }
  },
  de: {
    alert: {
      title: 'Stop',
      navText: 'Bitte warten Sie bis zu Ende gesprochen wurde oder beenden Sie es vorzeitig',
      checkBox: 'Sie müssen die Allgemeinen Geschäftsbedingungen akzeptieren, um fortzufahren'
    },
    welcomeScreen: {
      text: 'Herzlich Willkommen zu lea online'
    },
    registrationScreen: {
      headerTitle: 'Registrierung'
    },
    TandCScreen: {
      headerTitle: 'Allgemeine Geschäftsbedingungen',
      text: 'Hiermit stimme ich folgenden Bedingungen zu ...',
      checkBoxText: 'Ich habe die allgemeinen Geschäftsbedingungen gelesen und stimme ihnen zu'
    }
  }
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    keySeparator: false,
    nsSeparator: '.',
    lng: 'de', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

export default i18n
