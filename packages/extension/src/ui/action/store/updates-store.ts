import { defineStore } from 'pinia'
import { ref } from 'vue';
import UpdatesState from '@/libs/updates-state';
import { getLatestEnkryptUpdates } from '@action/utils/browser';
import { Updates } from '@/ui/action/types/updates';
import { gt as semverGT } from 'semver';

export const useUpdatesStore = defineStore('useUpdatesStore', () => {

  /**
   * Curretnt version of the app
   */
  const currentVersion = __PACKAGE_VERSION__;
  /**
   * @updatesState {UpdatesState} - An instance of the UpdatesState in I.
   */
  const updatesState = new UpdatesState();
  /**
   * @releases {Updates | null} - The latest Enkrypt updatesinn json object.
   */
  const releases = ref<Updates | null>(null);

  const stateCurrentReleaseTimestamp = ref<number>(0);
  /**
   * @updateIsLoaded {boolean} - A boolean value that indicates whether the updates are loaded.
   */
  const updatesIsLoaded = ref<boolean>(false);
  /**
   * @showUpdatesBtn {boolean} - A boolean value that indicates whether to show the updates button
   */
  const showUpdatesBtn = ref<boolean>(false);


  /**
* Asynchronously determines whether to show the updates button based on the last version viewed and the current version.
*
* The function performs the following steps:
* 1. Retrieves the last version viewed from the updates state.
* 2. Checks if the last version viewed is empty or if the current version is greater than the last version viewed.
* 3. If the above condition is true, calculates an expiration timestamp (2 weeks from the current release timestamp).
* 4. Sets the `showUpdatesBtn` value to true if the current release timestamp is less than the expiration timestamp.
* 5. Otherwise, sets the `showUpdatesBtn` value to false.
*
* If an error occurs during the process, it logs an error message to the console.
*
* @returns {Promise<void>} A promise that resolves when the function completes.
*/
  const getShowUpdatesBtn = async () => {
    try {
      const lastVersionViewed = await updatesState.getLastVersionViewed();
      if (
        lastVersionViewed === '' ||
        (currentVersion && semverGT(currentVersion, lastVersionViewed))
      ) {
        const expireTimestamp = stateCurrentReleaseTimestamp.value + 12096e5; //2 weeks;
        showUpdatesBtn.value =
          stateCurrentReleaseTimestamp.value < expireTimestamp;
      } else {
        showUpdatesBtn.value = false;
      }
    } catch (error) {
      console.error('Failed to get show updates button:', error);
    }
  };
  /**
* Initializes the update state by performing the following actions:
* 1. Retrieves the current release from the state.
* 2. Updates the current release timestamp.
* 3. If the current release is empty or different from the current version in the app state,
*    sets the current release and updates the release timestamp.
* 4. Fetches the latest Enkrypt updates and sets the releases state.
* 5. Displays the updates button if there are new releases.
* 6. Sets the updatesIsLoaded state to true if successful, otherwise false.
*
* @async
* @function initUpdateState
* @returns {Promise<void>} A promise that resolves when the update state is initialized.
* @throws Will log an error message if the initialization fails.
*/
  const init = async () => {
    try {

      const currentReleaseInState = await updatesState.getCurrentRelease();
      stateCurrentReleaseTimestamp.value =
        await updatesState.getCurrentReleaseTimestamp();
      if (
        currentReleaseInState === '' ||
        currentReleaseInState !== currentVersion
      ) {
        await updatesState.setCurrentRelease(currentVersion);
        const newReleaseTimestamp = Date.now();
        await updatesState.setCurrentReleaseTimestamp(newReleaseTimestamp);
        stateCurrentReleaseTimestamp.value = newReleaseTimestamp;
      }
      releases.value = await getLatestEnkryptUpdates();
      if (releases.value) {

        await getShowUpdatesBtn();
      }
      updatesIsLoaded.value = true;
    } catch (error) {
      console.error('Failed to init update state:', error);
      updatesIsLoaded.value = false;
    }
  };

  const setLastVersionViewed = async (_version: string) => {
    return updatesState.setLastVersionViewed(_version);
  }

  return {
    updatesState,
    releases,
    updatesIsLoaded,
    showUpdatesBtn,
    init,
    currentVersion,
    stateCurrentReleaseTimestamp,
    getShowUpdatesBtn,
    setLastVersionViewed
  }
})

