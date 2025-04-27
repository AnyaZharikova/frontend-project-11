import { setLocale } from 'yup'

export default () => {
  setLocale({
    mixed: {
      required: 'errors.invalidUrl',
    },
    string: {
      url: 'errors.invalidUrl',
    },
  })
}
