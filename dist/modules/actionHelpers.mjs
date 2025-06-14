import Utility from "./utility/Utility.mjs";
import {settings} from "./constants.mjs";

export function testOptions() {
  let options = {};

  if (pressedShift()) {
    options.fields = {
      rollMode: Utility.getSetting(settings.shiftRollMode),
    };
  }

  let bypass = Utility.getSetting(settings.bypassDefault);

  if (pressedAlt())
    bypass = !bypass;

  options.skipDialog = bypass;

  return options;
}


export function pressedAlt() {
  return game.keyboard.isModifierActive(KeyboardManager.MODIFIER_KEYS.ALT);
}

export function pressedShift() {
  return game.keyboard.isModifierActive(KeyboardManager.MODIFIER_KEYS.SHIFT);
}

export function pressedControl() {
  return game.keyboard.isModifierActive(KeyboardManager.MODIFIER_KEYS.CONTROL);
}

export function awardXP(actors) {
  new Dialog({
    title: game.i18n.localize("tokenActionHud.wfrp4e.actions.awardXP.DialogTitle"),
    content: `<form style="padding: 5px 0">
              <div class="form-group">
                <label>${game.i18n.localize("tokenActionHud.wfrp4e.actions.awardXP.Amount")}</label> 
                <input type="text" id="xp-amount" value="50" />
              </div>
              <div class="form-group">
                <label>${game.i18n.localize("tokenActionHud.wfrp4e.actions.awardXP.Reason")}</label> 
                <input type="text" id="reason" value="" placeholder="${game.i18n.localize("tokenActionHud.wfrp4e.actions.awardXP.Reason").toLowerCase()}" />
              </div>
          </form>`,
    buttons: {
      yes: {
        icon: "<i class='fas fa-check'></i>",
        label: game.i18n.localize("tokenActionHud.wfrp4e.actions.awardXP.Award"),
        callback: (html) => {
          const xp = Math.round(html.find("#xp-amount").val());
          const reason = html.find("#reason").val();

          if (isNaN(xp))
            return Utility.notify(game.i18n.localize("tokenActionHud.wfrp4e.actions.awardXP.XPNaN"), {type: "warning"});
          if (!reason)
            return Utility.notify(game.i18n.localize("tokenActionHud.wfrp4e.actions.awardXP.ReasonEmpty"), {type: "warning"});

          return updateActorsWithXP(actors, xp, reason);
        },
      },
      no: {
        icon: "<i class='fas fa-times'></i>",
        label: game.i18n.localize("Cancel"),
      },
    },
    default: "yes",
  }).render(true);
}


function prepareActorUpdate(actor, amount, reason) {
  const experience = foundry.utils.duplicate(actor.details.experience);
  experience.total += amount;
  experience.log.push({reason, amount, spent: experience.spent, total: experience.total, type: "total"});

  return {
    _id: actor._id,
    "system.details.experience": experience,
  };
}


async function updateActorsWithXP(actors, amount, reason) {
  let updates = [];

  for (let actor of actors) {
    if (actor.type !== "character") continue;

    let update = prepareActorUpdate(actor, amount, reason);
    updates.push(update);
  }

  await Actor.updateDocuments(updates);
}

export async function askMagicMethod(actor, spell) {
  return foundry.applications.api.DialogV2.wait({
    window: {
      title: game.i18n.localize("DIALOG.CastOrChannel"),
    },
    content: `<div class="cast-channel-dialog selection"> 
                <p>${game.i18n.localize("DIALOG.CastChannel")}</p> 
              </div>`,
    buttons: [
      {
        action: "cast",
        label: game.i18n.localize("Cast"),
        default: true
      },
      {
        action: "channel",
        label: game.i18n.localize("Channel"),
      },
    ],
    submit: (method) => {
      castOrChannel(actor, spell, method);
    }
  });
}

export async function castOrChannel(actor, spell, method = "cast") {
  let test;
  if (method === "cast")
    test = await castSpell(actor, spell);

  if (method === "channel")
    test = await channelSpell(actor, spell);

  await test.roll();

  return test;
}

async function castSpell(actor, spell) {
  return actor.setupCast(spell, testOptions());
}

async function channelSpell(actor, spell) {
  return actor.setupChannell(spell, testOptions())
}