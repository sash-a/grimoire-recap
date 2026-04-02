export const ROLES = {
  // Townsfolk (13)
  washerwoman: {
    name: 'Washerwoman',
    team: 'townsfolk',
    fields: {
      firstNight: [
        { key: 'player1', label: 'Shown player', type: 'player' },
        { key: 'player2', label: 'And', type: 'player' },
        { key: 'toldRole', label: 'Told role', type: 'role' },
      ],
    },
  },
  librarian: {
    name: 'Librarian',
    team: 'townsfolk',
    fields: {
      firstNight: [
        { key: 'player1', label: 'Shown player', type: 'player' },
        { key: 'player2', label: 'And', type: 'player' },
        { key: 'toldRole', label: 'Told role', type: 'role' },
      ],
    },
  },
  investigator: {
    name: 'Investigator',
    team: 'townsfolk',
    fields: {
      firstNight: [
        { key: 'player1', label: 'Shown player', type: 'player' },
        { key: 'player2', label: 'And', type: 'player' },
        { key: 'toldRole', label: 'Told role', type: 'role' },
      ],
    },
  },
  chef: {
    name: 'Chef',
    team: 'townsfolk',
    fields: {
      firstNight: [
        { key: 'number', label: 'Shown number', type: 'number', options: [0, 1, 2, 3, 4, 5] },
      ],
    },
  },
  empath: {
    name: 'Empath',
    team: 'townsfolk',
    fields: {
      firstNight: [
        { key: 'number', label: 'Shown number', type: 'number', options: [0, 1, 2] },
      ],
      otherNights: [
        { key: 'number', label: 'Shown number', type: 'number', options: [0, 1, 2] },
      ],
    },
  },
  fortuneTeller: {
    name: 'Fortune Teller',
    team: 'townsfolk',
    fields: {
      firstNight: [
        { key: 'player1', label: 'Asked about', type: 'player' },
        { key: 'player2', label: 'And', type: 'player' },
        { key: 'shown', label: 'Shown', type: 'yesno' },
      ],
      otherNights: [
        { key: 'player1', label: 'Asked about', type: 'player' },
        { key: 'player2', label: 'And', type: 'player' },
        { key: 'shown', label: 'Shown', type: 'yesno' },
      ],
    },
  },
  undertaker: {
    name: 'Undertaker',
    team: 'townsfolk',
    fields: {
      otherNights: [
        { key: 'shownRole', label: 'Shown role', type: 'role' },
      ],
      otherNightsCondition: 'afterExecution',
    },
  },
  monk: {
    name: 'Monk',
    team: 'townsfolk',
    fields: {
      otherNights: [
        { key: 'protected', label: 'Protected', type: 'player' },
      ],
    },
  },
  ravenkeeper: {
    name: 'Ravenkeeper',
    team: 'townsfolk',
    fields: {
      otherNights: [
        { key: 'chose', label: 'Chose', type: 'player' },
        { key: 'shownRole', label: 'Shown role', type: 'role' },
      ],
      otherNightsCondition: 'onDeath',
    },
  },
  virgin: { name: 'Virgin', team: 'townsfolk', fields: {} },
  slayer: { name: 'Slayer', team: 'townsfolk', fields: {} },
  soldier: { name: 'Soldier', team: 'townsfolk', fields: {} },
  mayor: { name: 'Mayor', team: 'townsfolk', fields: {} },

  // Outsiders (4)
  butler: {
    name: 'Butler',
    team: 'outsider',
    fields: {
      firstNight: [
        { key: 'master', label: 'Chose master', type: 'player' },
      ],
      otherNights: [
        { key: 'master', label: 'Chose master', type: 'player' },
      ],
    },
  },
  drunk: { name: 'Drunk', team: 'outsider', fields: {} },
  recluse: { name: 'Recluse', team: 'outsider', fields: {} },
  saint: { name: 'Saint', team: 'outsider', fields: {} },

  // Minions (4)
  poisoner: {
    name: 'Poisoner',
    team: 'minion',
    fields: {
      firstNight: [
        { key: 'poisoned', label: 'Poisoned', type: 'player' },
      ],
      otherNights: [
        { key: 'poisoned', label: 'Poisoned', type: 'player' },
      ],
    },
  },
  spy: {
    name: 'Spy',
    team: 'minion',
    fields: {
      firstNight: [
        { key: 'notes', label: 'Notes', type: 'text' },
      ],
      otherNights: [
        { key: 'notes', label: 'Notes', type: 'text' },
      ],
    },
  },
  scarletWoman: { name: 'Scarlet Woman', team: 'minion', fields: {} },
  baron: { name: 'Baron', team: 'minion', fields: {} },

  // Demon (1)
  imp: {
    name: 'Imp',
    team: 'demon',
    fields: {
      otherNights: [
        { key: 'killed', label: 'Killed', type: 'player' },
      ],
    },
  },
};

export const FIRST_NIGHT_ORDER = [
  'poisoner',
  'washerwoman',
  'librarian',
  'investigator',
  'chef',
  'empath',
  'fortuneTeller',
  'butler',
  'spy',
];

export const OTHER_NIGHT_ORDER = [
  'poisoner',
  'monk',
  'imp',
  'ravenkeeper',
  'fortuneTeller',
  'empath',
  'undertaker',
  'butler',
  'spy',
];

export function getRoleConfig(id) {
  return ROLES[id];
}

export function getRolesForTeam(team) {
  return Object.entries(ROLES)
    .filter(([, role]) => role.team === team)
    .map(([id, role]) => ({ id, ...role }));
}
