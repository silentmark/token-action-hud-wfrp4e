import {constants} from './constants.mjs';
import registerSettings from './settings.mjs';
import Utility from './utility/Utility.mjs';
import {SystemManagerWfrp4e} from "./SystemManager.mjs";

Hooks.once('init', () => {
  registerSettings();

  Hooks.callAll(`${constants.moduleId}:afterInit`);
});

Hooks.once('setup', () => {

  Hooks.callAll(`${constants.moduleId}:afterSetup`);
});

Hooks.once('ready', () => {
  Hooks.callAll(`${constants.moduleId}:afterReady`);
  Utility.notify(`${constants.moduleLabel} ready`, {consoleOnly: true});
});

Hooks.on('tokenActionHudCoreApiReady', async () => {
  /**
   * Return the SystemManager and requiredCoreModuleVersion to Token Action HUD Core
   */
  const module = game.modules.get(constants.moduleId)
  module.api = {
    requiredCoreModuleVersion: constants.requiredCoreModuleVersion,
    SystemManager: SystemManagerWfrp4e
  }
  Hooks.call('tokenActionHudSystemReady', module)
  Utility.notify(`${constants.moduleLabel} connected to TAH Core`, {consoleOnly: true});
})