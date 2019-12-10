import * as keytar from 'keytar'
import { constants, RegisteredKeychainAccountName } from '../../../constants'

/**
 * Stores a value in the user's keychain under the globally specified `appName`
 *
 * @param accountName The key to use for the stored password
 * @param value The value to set the stored password to
 */
export const setStoredPassword = async (
  accountName: RegisteredKeychainAccountName,
  value: string
): Promise<void> => {
  return keytar.setPassword(constants.appName, accountName, value)
}

/**
 * Retrieves a value in the user's keychain under the globally specified
 *   `appName`
 *
 * @param accountName The key to use when retrieving the stored password
 */
export const getStoredPassword = async (
  accountName: RegisteredKeychainAccountName
): Promise<string | null> => {
  return keytar.getPassword(constants.appName, accountName)
}

/**
 * Removes a value in the user's keychain under the globally specified `appName`
 *
 * @param accountName The key to use when removing the stored password
 */
export const removeStoredPassword = async (
  accountName: RegisteredKeychainAccountName
): Promise<boolean> => {
  return keytar.deletePassword(constants.appName, accountName)
}
