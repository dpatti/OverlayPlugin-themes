## Releases

### dev

URL: <https://dpatti.github.io/ffxiv-overlay/releases/dev/>

### v3

URL: <https://dpatti.github.io/ffxiv-overlay/releases/v3/>

* Shows limit break and other sources
* New, cleaner class icons
* Resets view to new encounter when it starts
* Added new view for deaths

### v2

URL: <https://dpatti.github.io/ffxiv-overlay/releases/v2/>

* Changed class colors to match fflogs
* Fixed sorting of damage meters when dps is unknown due to an upstream
  encounter duration glich
* Encounters in the drop-down have their times with them
* Fixed the encounter drop-down not updating the meters sometimes
* Remove the "End encounter" button and make the mode toggle display raid dps
  and hps
* Encounter history persists between reloads

### v1

URL: <https://dpatti.github.io/ffxiv-overlay/releases/v1/>

* Initial fork of [rdmty](https://github.com/billyvg/OverlayPlugin-themes)
* Added raid dps to header
* Added optional `?you=My_Name` to show your own name
* Numbers in the millions are formatted as 1.23M

## In development

```
yarn build
```

and

```
cd releases/dev && python -m http.server
```

- [ ] Update react and lodash, bundle to one file
- [ ] Do something about the stats pane
