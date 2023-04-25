module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors : "Tverdohleb Egor",
        description : "a home app to let my parents know if they can enter",
        name: "CanIEnter"
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin',"linux"],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
