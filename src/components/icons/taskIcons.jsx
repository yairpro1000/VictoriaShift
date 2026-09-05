const CATEGORY_IDS = {
  surfaces: '61c4f2c0-90b1-4a3d-89a6-2f5f4f26c101',
  beerTap: '61c4f2c0-90b1-4a3d-89a6-2f5f4f26c102',
  bread: '61c4f2c0-90b1-4a3d-89a6-2f5f4f26c103',
  cutlery: '61c4f2c0-90b1-4a3d-89a6-2f5f4f26c104',
  glasses: '61c4f2c0-90b1-4a3d-89a6-2f5f4f26c105',
  coffee: '61c4f2c0-90b1-4a3d-89a6-2f5f4f26c106',
  ketchup: '2eafac5e-c89a-49fb-9106-47976764e13d',
  floor: '61c4f2c0-90b1-4a3d-89a6-2f5f4f26c107',
  dates: '61c4f2c0-90b1-4a3d-89a6-2f5f4f26c108',
  trash: '61c4f2c0-90b1-4a3d-89a6-2f5f4f26c109',
  finalCheck: '61c4f2c0-90b1-4a3d-89a6-2f5f4f26c110',
}

const TASK_IDS = {
  waterBottlesArea: 'bb7819d0-6116-4218-a71f-84db6fa4a001',
  drinkPreparationArea: 'bb7819d0-6116-4218-a71f-84db6fa4a002',
  coffeeMachineArea: 'bb7819d0-6116-4218-a71f-84db6fa4a003',
  beerArea: 'bb7819d0-6116-4218-a71f-84db6fa4a004',
  breadCuttingArea: 'bb7819d0-6116-4218-a71f-84db6fa4a005',
  cutleryArea: 'bb7819d0-6116-4218-a71f-84db6fa4a006',
  breadStackArea: 'bb7819d0-6116-4218-a71f-84db6fa4a007',
  tapPipes: 'bb7819d0-6116-4218-a71f-84db6fa4a008',
  cleanTray: 'bb7819d0-6116-4218-a71f-84db6fa4a009',
  sink: 'bb7819d0-6116-4218-a71f-84db6fa4a010',
  replaceTray: 'bb7819d0-6116-4218-a71f-84db6fa4a011',
  beerTower: 'bb7819d0-6116-4218-a71f-84db6fa4a012',
  fondue: 'bb7819d0-6116-4218-a71f-84db6fa4a013',
  preCutSlices: 'bb7819d0-6116-4218-a71f-84db6fa4a014',
  wholeBreads: 'bb7819d0-6116-4218-a71f-84db6fa4a015',
  leftoverBreadContainer: 'bb7819d0-6116-4218-a71f-84db6fa4a016',
  cuttingBoardKnife: 'bb7819d0-6116-4218-a71f-84db6fa4a017',
  drawerContainers: 'bb7819d0-6116-4218-a71f-84db6fa4a018',
  baskets: 'bb7819d0-6116-4218-a71f-84db6fa4a019',
  soupPot: 'bb7819d0-6116-4218-a71f-84db6fa4a020',
  cutlery: 'bb7819d0-6116-4218-a71f-84db6fa4a021',
  glassStations: 'bb7819d0-6116-4218-a71f-84db6fa4a023',
  glasses: 'bb7819d0-6116-4218-a71f-84db6fa4a024',
  milk: 'bb7819d0-6116-4218-a71f-84db6fa4a025',
  milkPipe: 'bb7819d0-6116-4218-a71f-84db6fa4a026',
  smallTablet: 'bb7819d0-6116-4218-a71f-84db6fa4a027',
  cleaningCycle1: 'bb7819d0-6116-4218-a71f-84db6fa4a029',
  cleaningCycle2: 'bb7819d0-6116-4218-a71f-84db6fa4a030',
  groundsContainer: 'bb7819d0-6116-4218-a71f-84db6fa4a031',
  turnOffCoffeeMachine: 'bb7819d0-6116-4218-a71f-84db6fa4a032',
  dryBroom: 'bb7819d0-6116-4218-a71f-84db6fa4a033',
  detergentWater: 'bb7819d0-6116-4218-a71f-84db6fa4a034',
  wetBrush: 'bb7819d0-6116-4218-a71f-84db6fa4a035',
  squeegee: 'bb7819d0-6116-4218-a71f-84db6fa4a036',
  mopToDry: 'bb7819d0-6116-4218-a71f-84db6fa4a037',
  butter: 'bb7819d0-6116-4218-a71f-84db6fa4a038',
  redWines: 'bb7819d0-6116-4218-a71f-84db6fa4a039',
  whiteWines: 'bb7819d0-6116-4218-a71f-84db6fa4a040',
  rose: 'bb7819d0-6116-4218-a71f-84db6fa4a041',
  juices: 'bb7819d0-6116-4218-a71f-84db6fa4a042',
  milkCarton: 'bb7819d0-6116-4218-a71f-84db6fa4a043',
  officeTrash: 'bb7819d0-6116-4218-a71f-84db6fa4a044',
  restaurantLobbyTrash: 'bb7819d0-6116-4218-a71f-84db6fa4a045',
  upperSurfaces: 'bb7819d0-6116-4218-a71f-84db6fa4a046',
  staffDrinks: 'bb7819d0-6116-4218-a71f-84db6fa4a047',
  staffFood: 'bb7819d0-6116-4218-a71f-84db6fa4a048',
  nozzlesCover: 'f7be16f4-ff0f-4b7d-8969-716741bab69d',
  sealKetchupMayo: '015047b4-348c-4718-8d4c-58f3cdc9f815',
}

function DefaultTaskIcon(props) {
  return (
    <svg viewBox="0 0 48 48" data-default-icon="true" {...props}>
      <path d="M11 8h26c2 0 3.5 1.5 3.5 3.5v25c0 2-1.5 3.5-3.5 3.5H11c-2 0-3.5-1.5-3.5-3.5v-25C7.5 9.5 9 8 11 8Z" />
      <path d="M15 16h18v4H15v-4Z" fill="var(--icon-cutout)" />
      <path d="M15 25h18v4H15v-4Z" fill="var(--icon-cutout)" />
      <path d="M15 34h10v4H15v-4Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function SurfaceCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M7 27h34v13H7V27Z" />
      <path d="M13 16h22l6 11H7l6-11Z" />
      <path d="M13 32h22v3.5H13V32Z" fill="var(--icon-cutout)" />
      <path d="M34 7l2.3-4.8L38.5 7l4.8 2.2-4.8 2.3-2.2 4.8-2.3-4.8-4.8-2.3L34 7Z" />
      <path d="M10 12l1.5-3.2L13 12l3.2 1.5L13 15l-1.5 3.2L10 15l-3.2-1.5L10 12Z" />
    </svg>
  )
}

function BeerCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M13 17.4c-2.2-1.2-3.6-3.5-3.6-6.1 0-4.1 3.3-7.4 7.8-7.4 2 0 3.8.6 5.2 1.8 1.7-2.4 4.5-3.8 7.8-3.8 3.5 0 6.4 1.6 8.1 4.2 4.5.2 7.7 3.2 7.7 7.3 0 4.4-3.6 7.4-8.6 7.4h-2.1V37c0 4.5-3 7.5-7.4 7.5H19c-4.4 0-7.4-3-7.4-7.5V24.7c-1.3-1.6-1.1-4.9 1.4-7.3Z" />
      <path d="M35.4 24h5.1c3.5 0 5.9 2.5 5.9 6.1v5.6c0 3.6-2.4 6.1-5.9 6.1h-5.1v-6.4h4.1c.8 0 1.3-.5 1.3-1.4v-2.3c0-.9-.5-1.4-1.3-1.4h-4.1V24Z" />
      <path d="M16 18.8c2.5 2.2 6 2.2 8.2-.9 1-1.4 2.8-1.5 4.5-.5 2.8 1.7 5.4 1.2 7.7-.7v6.4c-3.4 1.3-6.9 1.1-10.5-.7-2.7 3.2-6.5 3.6-10.4 1.3-.3 1.7-1.4 3.2-3.4 4.4V21c1.9-.5 3.2-1.2 3.9-2.2Z" fill="var(--icon-cutout)" />
      <path d="M18.6 25.4c1.2 0 2.1.9 2.1 2.1v10.1c0 1.2-.9 2.1-2.1 2.1s-2.1-.9-2.1-2.1V27.5c0-1.2.9-2.1 2.1-2.1Z" fill="var(--icon-cutout)" />
      <path d="M25.2 24.5c1.2 0 2.1.9 2.1 2.1v11c0 1.2-.9 2.1-2.1 2.1s-2.1-.9-2.1-2.1v-11c0-1.2.9-2.1 2.1-2.1Z" fill="var(--icon-cutout)" />
      <path d="M31.7 25.4c1.2 0 2.1.9 2.1 2.1v10.1c0 1.2-.9 2.1-2.1 2.1s-2.1-.9-2.1-2.1V27.5c0-1.2.9-2.1 2.1-2.1Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function BreadCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M5 26c0-9.5 8-16.5 19-16.5s19 7 19 16.5v10.5c0 3.7-2.4 6.1-6.1 6.1H11.1C7.4 42.6 5 40.2 5 36.5V26Z" />
      <path d="M13 24c2-5 5.5-8 10.5-9.2" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="4.2" />
      <path d="M25.5 14.8c5 1.2 8.5 4.2 10.5 9.2" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="4.2" />
      <path d="M12.5 32h23v4.4h-23V32Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function CutleryCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M5 4h4v17h2V4h4v17h2V4h4v20c0 4-2.8 7.2-6.5 8v12h-7V32C3.8 31.2 1 28 1 24V4h4Z" />
      <path d="M24.5 5c5.7 3.3 8.2 8.5 7.5 15.6-.5 4.7-2.7 8.3-6.5 10.8V44h-7V31.4c-3.6-2.5-4.3-7-2.1-13.4 1.4-4.1 4.1-8.4 8.1-13Z" />
      <path d="M38.5 4c4.6 7.5 4.5 14.4-.5 20.8V44h-7V24.8c-2.6-6.8-.1-13.7 7.5-20.8Z" />
    </svg>
  )
}

function GlassesCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M7 6h14l-2.2 24c-.4 4.8-3 8-7 8s-6.6-3.2-7-8L2.6 6H7Z" />
      <path d="M12 38h2v4h6v4H3v-4h6v-4h3Z" />
      <path d="M28 5h15l-3 29c-.5 5-3 8.2-7.5 8.2S25.5 39 25 34L22 5h6Z" />
      <path d="M7.5 13h9.5v3.4H7.5V13Z" fill="var(--icon-cutout)" />
      <path d="M27.5 13h10.5v3.4H27.5V13Z" fill="var(--icon-cutout)" />
      <path d="M30.5 23h5.5v3h-5.5v-3Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function CoffeeCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M7 12h29v24c0 5-3.5 8.5-8.5 8.5h-12C10.5 44.5 7 41 7 36V12Z" />
      <path d="M36 18h5.5c3.7 0 6 2.5 6 6v6c0 3.5-2.3 6-6 6H36v-6h4.6c1 0 1.6-.6 1.6-1.6v-2.8c0-1-.6-1.6-1.6-1.6H36v-6Z" />
      <path d="M13.5 18h16v4.5h-16V18Z" fill="var(--icon-cutout)" />
      <path d="M15 31h13.5v4H15v-4Z" fill="var(--icon-cutout)" />
      <path d="M15 4.5c-2 2.3-2 4.8 0 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.6" />
      <path d="M25 3.5c-2 2.5-2 5.4 0 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.6" />
    </svg>
  )
}

function KetchupCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M15 5h13v6l-3.5 5.5v25c0 3-2 5-5 5h-3c-3 0-5-2-5-5v-25L8 11V5h7Z" />
      <path d="M30 14h5.5c3.7 0 6.5 2.8 6.5 6.5V43h-8V23c0-1-.7-1.7-1.7-1.7H30V14Z" />
      <path d="M13.5 8h13v3.2h-13V8Z" fill="var(--icon-cutout)" />
      <path d="M15.5 22h6v15h-6V22Z" fill="var(--icon-cutout)" />
      <path d="M32 26h8v4.2h-8V26Z" fill="var(--icon-cutout)" />
      <path d="M36.5 4 39 8.6l5 1.6-4 3.3.1 5.2-4.3-2.7-4.9 1.7 1.3-5-3.2-4.1 5.2-.3L36.5 4Z" />
    </svg>
  )
}

function FloorCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M22 3h7v28h-7V3Z" />
      <path d="M11 30h27l5 14H6l5-14Z" />
      <path d="M14 35h22v3.2H14V35Z" fill="var(--icon-cutout)" />
      <path d="M16 30l-4-8h25l-4 8H16Z" />
    </svg>
  )
}

function DatesCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M10.5 6.5h27c3.2 0 5.5 2.3 5.5 5.5v27c0 3.2-2.3 5.5-5.5 5.5h-27C7.3 44.5 5 42.2 5 39V12c0-3.2 2.3-5.5 5.5-5.5Z" />
      <path d="M5 16.5h38v5H5v-5Z" fill="var(--icon-cutout)" />
      <path d="M13.5 3h5v9h-5V3Z" fill="var(--icon-cutout)" />
      <path d="M29.5 3h5v9h-5V3Z" fill="var(--icon-cutout)" />
      <path d="M14 27h6v6h-6v-6Z" fill="var(--icon-cutout)" />
      <path d="M24 27h6v6h-6v-6Z" fill="var(--icon-cutout)" />
      <path d="M34 27h5v6h-5v-6Z" fill="var(--icon-cutout)" />
      <path d="M14 36h6v5h-6v-5Z" fill="var(--icon-cutout)" />
      <path d="M24 36h6v5h-6v-5Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function TrashCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M13 15h22l-2.7 29H15.7L13 15Z" />
      <path d="M9.5 10h29v6H9.5v-6Z" />
      <path d="M18 5h12c2 0 3.5 1.5 3.5 3.5V11h-19V8.5C14.5 6.5 16 5 18 5Z" />
      <path d="M19 21h3v17h-3V21Z" fill="var(--icon-cutout)" />
      <path d="M26 21h3v17h-3V21Z" fill="var(--icon-cutout)" />
      <path d="M9 28l-5 4 5 4v-2h4v-4H9v-2Z" />
      <path d="M39 28l5 4-5 4v-2h-4v-4h4v-2Z" />
    </svg>
  )
}

function FinalCheckCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M24 3.5 29.3 14l11.7 1.7-8.5 8.2 2 11.6L24 30l-10.5 5.5 2-11.6L7 15.7 18.7 14 24 3.5Z" />
      <path d="M10 37h28v7H10v-7Z" />
      <path d="M17 23.8 22 29l10.5-12.5" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4.3" />
      <path d="M16 40h16v2.6H16V40Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function BottleIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M10 5h9v7l-3 6v23c0 3-2 5-5 5H9c-3 0-5-2-5-5V18l3-6V5h3Z" />
      <path d="M29 4h9v8l4 7v22c0 3-2 5-5 5h-4c-3 0-5-2-5-5V19l4-7V4h-3Z" />
      <path d="M7 8h9v3H7V8Z" fill="var(--icon-cutout)" />
      <path d="M31 8h9v3H31V8Z" fill="var(--icon-cutout)" />
      <path d="M8 25h6v11H8V25Z" fill="var(--icon-cutout)" />
      <path d="M32 25h7v12h-7V25Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function PrepCounterIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M6 23h36v19H6V23Z" />
      <path d="M12 13h24l6 10H6l6-10Z" />
      <path d="M12 28h24v3.5H12V28Z" fill="var(--icon-cutout)" />
      <path d="M12 35h10v3.5H12V35Z" fill="var(--icon-cutout)" />
      <path d="M28 35h8v3.5h-8V35Z" fill="var(--icon-cutout)" />
      <path d="M15 6h5v10h-5V6Z" />
      <path d="M26 5h10v6l-3 5h-7V5Z" />
    </svg>
  )
}

function CoffeeAreaIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M8 11h27v28c0 4.5-3 7.5-7.5 7.5h-12C11 46.5 8 43.5 8 39V11Z" />
      <path d="M35 18h5.5c3.5 0 5.8 2.3 5.8 5.8v7.4c0 3.5-2.3 5.8-5.8 5.8H35v-6h4.5c.9 0 1.5-.6 1.5-1.5v-3.4c0-.9-.6-1.5-1.5-1.5H35V18Z" />
      <path d="M14 17h15v5H14v-5Z" fill="var(--icon-cutout)" />
      <path d="M16 31h11v4H16v-4Z" fill="var(--icon-cutout)" />
      <path d="M15 3.5c-2.2 2.4-2.2 5.1 0 7.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
      <path d="M25 2.5c-2.2 2.7-2.2 5.7 0 8.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
    </svg>
  )
}

function BeerAreaIcon(props) {
  return <BeerCategoryIcon {...props} />
}

function BreadCuttingAreaIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M5 24h28c6.5 0 10.5 4.2 10.5 10.5V42H5V24Z" />
      <path d="M12 30h22v4H12v-4Z" fill="var(--icon-cutout)" />
      <path d="M14.5 10h6v23h-6V10Z" />
      <path d="M23.5 4.5 45 24l-5 5.5L18.5 10l5-5.5Z" />
      <path d="M27 9.5 39.7 21" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="2.8" />
    </svg>
  )
}

function CutleryAreaIcon(props) {
  return <CutleryCategoryIcon {...props} />
}

function BreadStackIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M9 10h30c2.5 0 4 1.5 4 4v5H5v-5c0-2.5 1.5-4 4-4Z" />
      <path d="M7 21h34v8H7v-8Z" />
      <path d="M10 31h28c2.5 0 4 1.5 4 4v5H6v-5c0-2.5 1.5-4 4-4Z" />
      <path d="M13 14h22v2.8H13V14Z" fill="var(--icon-cutout)" />
      <path d="M12 24h24v2.8H12V24Z" fill="var(--icon-cutout)" />
      <path d="M14 35h20v2.8H14V35Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function TapPipesIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M20 17h8v18h-8V17Z" />
      <path d="M16.5 35h15l3.5 7H13l3.5-7Z" />
      <path d="M13 13h22v9H13v-9Z" />
      <path d="M20 7.5a4 4 0 1 1 8 0V15h-8V7.5Z" />
      <path d="M6 10h8v14H6V10Z" />
      <path d="M34 10h8v14h-8V10Z" />
      <path d="M3 18h15v7H3v-7Z" />
      <path d="M30 18h15v7H30v-7Z" />
      <path d="M3.5 24h6.5l-2.2 6.5H2.4l1.1-6.5Z" />
      <path d="M38 24h6.5l1.1 6.5h-5.4L38 24Z" />
      <path d="M24 13.5a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
      <path d="M24 17.2a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6Z" fill="var(--icon-cutout)" />
      <path d="M9 32c-1.7 1.8-1.7 4.2 0 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.4" />
      <path d="M39 32c1.7 1.8 1.7 4.2 0 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.4" />
    </svg>
  )
}

function BeerNetDishwasherIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M24 2.5c4.3 5.2 6.5 9 6.5 11.8a6.5 6.5 0 0 1-13 0c0-2.8 2.2-6.6 6.5-11.8Z" />
      <path d="M5 21h33v22H5V21Z" />
      <path d="M41 28.5 47 34l-6 5.5v-3.3h-5.5v-4.4H41v-3.3Z" />
      <path d="M10.5 26h22v3.2h-22V26Z" fill="var(--icon-cutout)" />
      <path d="M10.5 33h22v3.2h-22V33Z" fill="var(--icon-cutout)" />
      <path d="M14 23.5h3.2v17H14v-17Z" fill="var(--icon-cutout)" />
      <path d="M21.4 23.5h3.2v17h-3.2v-17Z" fill="var(--icon-cutout)" />
      <path d="M28.8 23.5H32v17h-3.2v-17Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function BeerBasinIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M5.5 16h37v26h-37V16Z" />
      <path d="M24 23a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19Z" fill="var(--icon-cutout)" />
      <path d="M24 28.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
      <path d="M11 20.5h26v3.2H11v-3.2Z" fill="var(--icon-cutout)" />
      <path d="M11 36.8h7v3.2h-7v-3.2Z" fill="var(--icon-cutout)" />
      <path d="M30 36.8h7v3.2h-7v-3.2Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function BeerNetReturnIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M5 21h33v22H5V21Z" />
      <path d="M35 4.5 44 12l-9 7.5v-4.2H24.2c-3.2 0-5.3 2.1-5.3 5.2h-7.5c0-7.4 5.3-12.8 12.8-12.8H35V4.5Z" />
      <path d="M10.5 26h22v3.2h-22V26Z" fill="var(--icon-cutout)" />
      <path d="M10.5 33h22v3.2h-22V33Z" fill="var(--icon-cutout)" />
      <path d="M14 23.5h3.2v17H14v-17Z" fill="var(--icon-cutout)" />
      <path d="M21.4 23.5h3.2v17h-3.2v-17Z" fill="var(--icon-cutout)" />
      <path d="M28.8 23.5H32v17h-3.2v-17Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function BeerTapWipeIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M20 16.5h8v17h-8v-17Z" />
      <path d="M16.5 33.5h15L35 42H13l3.5-8.5Z" />
      <path d="M13 12.5h22v9H13v-9Z" />
      <path d="M20 7.5a4 4 0 1 1 8 0V15h-8V7.5Z" />
      <path d="M6 10h8v14H6V10Z" />
      <path d="M34 10h8v14h-8V10Z" />
      <path d="M3 18h15v7H3v-7Z" />
      <path d="M30 18h15v7H30v-7Z" />
      <path d="M24 13.2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
      <path d="M24 17a2.2 2.2 0 1 1 0 4.4A2.2 2.2 0 0 1 24 17Z" fill="var(--icon-cutout)" />
      <path d="M9 27.5 22 20l5.5 9.5-13 7.5L9 27.5Z" />
      <path d="M12.5 30.5 23.3 24" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="3.2" />
      <path d="M8 6.5 10 2l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2Z" />
    </svg>
  )
}

function FondueIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M10 17h28l-4.5 19H14.5L10 17Z" />
      <path d="M7 14h34v6H7v-6Z" />
      <path d="M14 36h6v9h-6v-9Z" />
      <path d="M28 36h6v9h-6v-9Z" />
      <path d="M17 8c-2.1 2.2-2.1 4.5 0 6.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
      <path d="M25 5.5c-2.3 2.6-2.3 5.6 0 8.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
      <path d="M33 8c-2.1 2.2-2.1 4.5 0 6.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
      <path d="M16 24h16v4H16v-4Z" fill="var(--icon-cutout)" />
      <path d="M21.5 30h5v3.2h-5V30Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function BreadSliceIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M9 20c0-8.8 6.5-14.5 15-14.5S39 11.2 39 20v18c0 3.8-2.4 6.2-6.2 6.2H15.2C11.4 44.2 9 41.8 9 38V20Z" />
      <path d="M16 23c3.2-4.8 7.9-7.2 14-7.2" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="4.2" />
      <path d="M16 33h16v4.3H16V33Z" fill="var(--icon-cutout)" />
      <path d="M33 9c2 2.5 2.9 5.6 2.9 9.3" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="2.8" />
    </svg>
  )
}

function WholeBreadIcon(props) {
  return <BreadCategoryIcon {...props} />
}

function BreadContainerIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M6 18h36v24H6V18Z" />
      <path d="M12 10h24c2.5 0 4 1.5 4 4v6H8v-6c0-2.5 1.5-4 4-4Z" />
      <path d="M13 24h22v4H13v-4Z" fill="var(--icon-cutout)" />
      <path d="M13 33h12v4H13v-4Z" fill="var(--icon-cutout)" />
      <path d="M30 32a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function CuttingBoardKnifeIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M7 10.5h24c3 0 5 2 5 5v23c0 3-2 5-5 5H7v-33Z" />
      <path d="M31 5 45.5 19.5 40 25 25.5 10.5 31 5Z" />
      <path d="M13 17h11v4H13v-4Z" fill="var(--icon-cutout)" />
      <path d="M13 29h15v4H13v-4Z" fill="var(--icon-cutout)" />
      <path d="M30.5 9.5 41 20" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="2.6" />
    </svg>
  )
}

function CrumbDrawerIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M6 15h36v27H6V15Z" />
      <path d="M11 9h26v9H11V9Z" />
      <path d="M14 24h20v4H14v-4Z" fill="var(--icon-cutout)" />
      <path d="M14.5 35.5a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z" fill="var(--icon-cutout)" />
      <path d="M23.5 37a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z" fill="var(--icon-cutout)" />
      <path d="M32 35a2.3 2.3 0 1 0 0-4.6A2.3 2.3 0 0 0 32 35Z" fill="var(--icon-cutout)" />
      <path d="M15 12h18v2.8H15V12Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function BasketStackIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M8 21h32l-4.5 20H12.5L8 21Z" />
      <path d="M14 10h20l4.5 12h-29L14 10Z" />
      <path d="M13 26h22v3H13v-3Z" fill="var(--icon-cutout)" />
      <path d="M14.5 33h19v3H14.5v-3Z" fill="var(--icon-cutout)" />
      <path d="M18 23l2.3 17h-3.2l-2.3-17H18Z" fill="var(--icon-cutout)" />
      <path d="M30 23l-2.3 17h3.2l2.3-17H30Z" fill="var(--icon-cutout)" />
      <path d="M18 14h12v3H18v-3Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function SoupPotIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M11 18h26v22c0 2.5-1.5 4-4 4H15c-2.5 0-4-1.5-4-4V18Z" />
      <path d="M7 15h34v6H7v-6Z" />
      <path d="M15 9h18v7H15V9Z" />
      <path d="M9 24H3v10h6V24Z" />
      <path d="M45 24h-6v10h6V24Z" />
      <path d="M17 4.5c-2.2 2.2-2.2 4.7 0 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
      <path d="M27 3.5c-2.2 2.5-2.2 5.2 0 7.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
      <path d="M17 27h14v4H17v-4Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function CutleryTaskIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M5 5h4v16h2V5h4v16h2V5h4v19c0 4.2-2.6 7.3-6.5 8.2V44h-7V32.2C3.6 31.3 1 28.2 1 24V5h4Z" />
      <path d="M28 6c5.2 3.2 7.4 8.2 6.7 15-.5 4.4-2.6 7.8-6.2 10.2V44h-7V31.2c-3.6-2.4-4.4-6.7-2.2-12.8C20.7 14.5 23.6 10.4 28 6Z" />
      <path d="M41 5c3.9 6.8 3.6 13-.7 18.6V44h-6.5V23.6c-2.2-6.2.2-12.4 7.2-18.6Z" />
      <path d="M36 4l1.8 3.8 3.8 1.8-3.8 1.8L36 15.2l-1.8-3.8-3.8-1.8 3.8-1.8L36 4Z" />
    </svg>
  )
}

function GlassStationIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M8 8h14l-2.4 25.5c-.4 4.5-2.9 7.4-6.7 7.4S6.6 38 6.2 33.5L3.8 8H8Z" />
      <path d="M13 41h2v4.5H5.5V41H13Z" />
      <path d="M28 6h15l-3 29c-.5 5-3 8-7.4 8s-6.9-3-7.4-8l-3-29H28Z" />
      <path d="M8.2 15h9.5v3H8.2v-3Z" fill="var(--icon-cutout)" />
      <path d="M27.8 14h10.7v3.2H27.8V14Z" fill="var(--icon-cutout)" />
      <path d="M34.5 2.5 36.8 7l4.7 1.6-3.8 3.2.1 5-4.2-2.7-4.8 1.6 1.3-4.8-3-4 5-.2 2.4-4.2Z" />
    </svg>
  )
}

function PolishGlassesIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M13 6h22l-3.2 26.5c-.5 4.8-3.4 7.8-7.8 7.8s-7.3-3-7.8-7.8L13 6Z" />
      <path d="M24 40h3v4h8v4H13v-4h8v-4h3Z" />
      <path d="M18 14h12.5v3.2H18V14Z" fill="var(--icon-cutout)" />
      <path d="M20 25h8v3.2h-8V25Z" fill="var(--icon-cutout)" />
      <path d="M10.5 24 12.6 28l4.4 1.6-3.7 2.8.1 4.6-3.8-2.6L5.2 36l1.2-4.4-2.9-3.6 4.6-.2 2.4-3.8Z" />
    </svg>
  )
}

function MilkIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M14 4h17v9l5 6.5V42c0 3-2 5-5 5H14c-3 0-5-2-5-5V19.5L14 13V4Z" />
      <path d="M15 8h15v4H15V8Z" fill="var(--icon-cutout)" />
      <path d="M15 24h15.5v13H15V24Z" fill="var(--icon-cutout)" />
      <path d="M20 27h3v7h-3v-7Z" />
      <path d="M27 2l2.4 4.6 5 1.5-4 3.2.2 5.2-4.4-2.8-4.8 1.8 1.3-5-3.3-4.1 5.2-.3L27 2Z" />
    </svg>
  )
}

function MilkPipeIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M8 11h20c6.8 0 11.5 4.7 11.5 11.5v8h-8v-7.2c0-2.6-1.5-4.1-4.1-4.1H8V11Z" />
      <path d="M29 29h14.5v14.5H29V29Z" />
      <path d="M33.7 33h4.5v6.5h-4.5V33Z" fill="var(--icon-cutout)" />
      <path d="M11 24h6v19h-6V24Z" />
      <path d="M14 24c6.2 2.5 9.3 6.8 9.3 13h-7c0-2.6-1.5-4.6-4.5-6L14 24Z" />
    </svg>
  )
}

function TabletIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M15 5h18c5 0 8.5 3.5 8.5 8.5v21c0 5-3.5 8.5-8.5 8.5H15c-5 0-8.5-3.5-8.5-8.5v-21C6.5 8.5 10 5 15 5Z" />
      <path d="M12 15h24v16H12V15Z" fill="var(--icon-cutout)" />
      <path d="M17 20h14v3.3H17V20Z" />
      <path d="M17 26h9v3.3h-9V26Z" />
      <path d="M24 35.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function CycleOneIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M10 9h24v27c0 4-2.5 6.5-6.5 6.5h-11C12.5 42.5 10 40 10 36V9Z" />
      <path d="M34 15h5c3.2 0 5.2 2 5.2 5.2v8.6c0 3.2-2 5.2-5.2 5.2h-5v-6h3.8v-7H34v-6Z" />
      <path d="M16 15h12v4.2H16V15Z" fill="var(--icon-cutout)" />
      <path d="M21.5 24h4.5v12h-4.5V24Z" fill="var(--icon-cutout)" />
      <path d="M21 2.5c-3.8 1-6.5 4.2-6.5 8.2h4.8l-7.1 7.1-7.1-7.1h4.1C9.2 4.8 14 0.7 21 0.7v1.8Z" />
    </svg>
  )
}

function NozzlesCoverIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M8 7h32v11H8V7Z" />
      <path d="M12 18h9v23h-9V18Z" />
      <path d="M27 18h9v23h-9V18Z" />
      <path d="M10 41h28v5H10v-5Z" />
      <path d="M15.5 23h3v12h-3V23Z" fill="var(--icon-cutout)" />
      <path d="M30.5 23h3v12h-3V23Z" fill="var(--icon-cutout)" />
      <path d="M13 11h22v3.5H13V11Z" fill="var(--icon-cutout)" />
      <path d="M20.5 36h7v3h-7v-3Z" />
    </svg>
  )
}

function CycleTwoIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M10 9h24v27c0 4-2.5 6.5-6.5 6.5h-11C12.5 42.5 10 40 10 36V9Z" />
      <path d="M34 15h5c3.2 0 5.2 2 5.2 5.2v8.6c0 3.2-2 5.2-5.2 5.2h-5v-6h3.8v-7H34v-6Z" />
      <path d="M16 15h12v4.2H16V15Z" fill="var(--icon-cutout)" />
      <path d="M16.5 24h8v4h-4v3.5h4.5v4H14.5v-7.4c0-2.5.8-3.8 2-4.1Z" fill="var(--icon-cutout)" />
      <path d="M27 24h5.5v11.5H27V24Z" fill="var(--icon-cutout)" />
      <path d="M21 2.5c-3.8 1-6.5 4.2-6.5 8.2h4.8l-7.1 7.1-7.1-7.1h4.1C9.2 4.8 14 0.7 21 0.7v1.8Z" />
    </svg>
  )
}

function GroundsIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M11 15h26l-3.2 28.5H14.2L11 15Z" />
      <path d="M8 9.5h32v7H8v-7Z" />
      <path d="M16 22.5h16v4H16v-4Z" fill="var(--icon-cutout)" />
      <path d="M17.5 35.5a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" fill="var(--icon-cutout)" />
      <path d="M25 37.5a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" fill="var(--icon-cutout)" />
      <path d="M31.5 34.8a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" fill="var(--icon-cutout)" />
      <path d="M18 4h12v6H18V4Z" />
    </svg>
  )
}

function PowerOffIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M21 3h6.5v21H21V3Z" />
      <path d="M15.5 9.5C8.4 13 4 20 4 28.5 4 39.5 12.3 47 24.2 47S44 39.5 44 28.5c0-8.5-4.4-15.5-11.5-19v8.2c3.4 2.4 5.3 6.1 5.3 10.8 0 7.4-5.5 12.5-13.6 12.5S10.6 35.9 10.6 28.5c0-4.7 2-8.4 5.4-10.8l-.5-8.2Z" />
      <path d="M18 29a6 6 0 1 0 12 0" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="3.2" />
    </svg>
  )
}

function BroomIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M29 3h6.5v27h-6.5V3Z" />
      <path d="M18 29h26l2.5 15H16l2-15Z" />
      <path d="M21 34h20v3.2H21V34Z" fill="var(--icon-cutout)" />
      <path d="M11 7.5 30 26l-5.2 5.2L5.8 12.7 11 7.5Z" />
      <path d="M22 39h18v2.5H22V39Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function DetergentWaterIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M13 5h15v9.5l5.5 7V42c0 3-2 5-5 5H13c-3 0-5-2-5-5V21.5l5-7V5Z" />
      <path d="M14 10h13v4H14v-4Z" fill="var(--icon-cutout)" />
      <path d="M35 13c4.5 5.4 6.8 9.3 6.8 12a6.8 6.8 0 0 1-13.6 0c0-2.7 2.3-6.6 6.8-12Z" />
      <path d="M14 28h14v10.5H14V28Z" fill="var(--icon-cutout)" />
      <path d="M17 31h7v3h-7v-3Z" />
    </svg>
  )
}

function WetBrushIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M8 31h31v10.5H8V31Z" />
      <path d="M12 23.5h24v8.5H12v-8.5Z" />
      <path d="M20 4.5h8v20h-8v-20Z" />
      <path d="M12 41h3.3v5h-3.3v-5Z" />
      <path d="M20 41h3.3v5h-3.3v-5Z" />
      <path d="M28 41h3.3v5h-3.3v-5Z" />
      <path d="M36 7.5c3.6 4.5 5.4 7.8 5.4 10a5.4 5.4 0 0 1-10.8 0c0-2.2 1.8-5.5 5.4-10Z" />
      <path d="M14 35h19v2.8H14V35Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function SqueegeeIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M21 3h7v26h-7V3Z" />
      <path d="M6 27h36v8H6v-8Z" />
      <path d="M10 35h29.5l-4.5 8.5H14.5L10 35Z" />
      <path d="M13 30h22v2.8H13V30Z" fill="var(--icon-cutout)" />
      <path d="M16 39h16v2.4H16V39Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function MopIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M21 3h7v27h-7V3Z" />
      <path d="M11 29h26l6.5 15.5H4.5L11 29Z" />
      <path d="M15.5 32 12 42" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="3" />
      <path d="M24 32v11" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="3" />
      <path d="M32.5 32 36 42" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="3" />
      <path d="M17 30h14v3H17v-3Z" />
    </svg>
  )
}

function ButterIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M7 20h30l5.5 8.5V42h-30L7 33.5V20Z" />
      <path d="M13 12h24.5v9H7.5L13 12Z" />
      <path d="M15 27h17.5v5H15v-5Z" fill="var(--icon-cutout)" />
      <path d="M15 35h21v3H15v-3Z" fill="var(--icon-cutout)" />
      <path d="M35 4.5 37.3 9l4.7 1.7-3.8 3 .1 5-4.2-2.6-4.7 1.6 1.2-4.7-3-3.8 4.9-.3L35 4.5Z" />
    </svg>
  )
}

function WineBottleIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M11 5h8v8l-3 7v21c0 3-2 5-5 5H9c-3 0-5-2-5-5V20l3-7V5h4Z" />
      <path d="M28 4h9v9l4 7v21c0 3-2 5-5 5h-4c-3 0-5-2-5-5V20l4-7V4h-3Z" />
      <path d="M7 8h9v3H7V8Z" fill="var(--icon-cutout)" />
      <path d="M30 8h9v3H30V8Z" fill="var(--icon-cutout)" />
      <path d="M8 26h6v11H8V26Z" fill="var(--icon-cutout)" />
      <path d="M31 26h7v11h-7V26Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function WhiteWineIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M17 4h14v9.5l-4 7.5v20c0 3.2-2.2 5.2-5.2 5.2s-5.2-2-5.2-5.2V21l-4-7.5V4H17Z" />
      <path d="M16 8h16v3.6H16V8Z" fill="var(--icon-cutout)" />
      <path d="M18.5 24.5h7.5V39h-7.5V24.5Z" fill="var(--icon-cutout)" />
      <path d="M35 6l2.1 4.2 4.4 1.6-3.7 2.8.2 4.7-4-2.5-4.4 1.5 1.2-4.4-2.9-3.6 4.6-.3L35 6Z" />
      <path d="M5 31l7 7-4 4-7-7 4-4Z" />
    </svg>
  )
}

function RoseWineIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M17 4h14v9.5l-4 7.5v20c0 3.2-2.2 5.2-5.2 5.2s-5.2-2-5.2-5.2V21l-4-7.5V4H17Z" />
      <path d="M16.5 27h11.5v10.5H16.5V27Z" fill="var(--icon-cutout)" />
      <path d="M34 25.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Z" />
      <path d="M34 29.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Z" fill="var(--icon-cutout)" />
      <path d="M16 8h16v3.6H16V8Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function JuiceIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M10 10h28l-3.3 34H13.3L10 10Z" />
      <path d="M8 6h32v6H8V6Z" />
      <path d="M15.5 20h17v14.5h-17V20Z" fill="var(--icon-cutout)" />
      <path d="M30 3.5h8v5.5h-8V3.5Z" />
      <path d="M20 24a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
      <path d="M28 24h3v8h-3v-8Z" />
    </svg>
  )
}

function MilkCartonIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M10 15h27v30H10V15Z" />
      <path d="M10 15 18.5 4.5H37L28.5 15H10Z" />
      <path d="M28.5 15H37L28.5 4.5V15Z" />
      <path d="M15 24h17v12.5H15V24Z" fill="var(--icon-cutout)" />
      <path d="M18 27h4v7h-4v-7Z" />
      <path d="M24 27h5v3h-5v-3Z" />
      <path d="M24 32h5v3h-5v-3Z" />
    </svg>
  )
}

function OfficeTrashIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M13 16h22l-2.5 27H15.5L13 16Z" />
      <path d="M9.5 11h29v6H9.5v-6Z" />
      <path d="M17.5 5.5h13v6.5h-13V5.5Z" />
      <path d="M5 28h9v11H5V28Z" />
      <path d="M20 22h3v16h-3V22Z" fill="var(--icon-cutout)" />
      <path d="M27 22h3v16h-3V22Z" fill="var(--icon-cutout)" />
      <path d="M7 31h5v5H7v-5Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function LobbyTrashIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M12 15h24l-3 28H15l-3-28Z" />
      <path d="M8.5 10h31v6h-31v-6Z" />
      <path d="M18 5h12.5v6H18V5Z" />
      <path d="M35 27h8.5v8H35v-8Z" />
      <path d="M18.5 21h3v17h-3V21Z" fill="var(--icon-cutout)" />
      <path d="M26.8 21h3v17h-3V21Z" fill="var(--icon-cutout)" />
      <path d="M37.2 29.4h4v3.2h-4v-3.2Z" fill="var(--icon-cutout)" />
      <path d="M40 20l2.5 4.5h-5L40 20Z" />
    </svg>
  )
}

function UpperSurfaceIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M6 26h36v14H6V26Z" />
      <path d="M12 15.5h24l6 10.5H6l6-10.5Z" />
      <path d="M13 31h22v3.5H13V31Z" fill="var(--icon-cutout)" />
      <path d="M34 6.5 36.2 11l4.8 1.7-3.9 3.1.1 5.1-4.3-2.7-4.8 1.7 1.3-4.8-3.1-4 5-.3L34 6.5Z" />
      <path d="M10 9l1.8 3.8 4.1 1.4-3.3 2.6.1 4.4-3.7-2.3-4.1 1.4L6 16.2l-2.6-3.4 4.3-.3L10 9Z" />
    </svg>
  )
}

function StaffDrinksIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M9 10h15l-2.2 23.5c-.4 4.5-2.8 7.5-6.7 7.5s-6.3-3-6.7-7.5L6.2 10H9Z" />
      <path d="M15 41h2v4.5H7v-4.5h8Z" />
      <path d="M32 7h8.5v32c0 4.5-3 7.5-7.5 7.5s-7.5-3-7.5-7.5V22l6.5-6V7Z" />
      <path d="M11.5 16.5h8.5v3H11.5v-3Z" fill="var(--icon-cutout)" />
      <path d="M31 27h6.5v10.5H31V27Z" fill="var(--icon-cutout)" />
      <path d="M31 10h9v3.5h-9V10Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function StaffFoodIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M24 8a17.5 17.5 0 1 1 0 35 17.5 17.5 0 0 1 0-35Z" />
      <path d="M24 15.5a10 10 0 1 1 0 20 10 10 0 0 1 0-20Z" fill="var(--icon-cutout)" />
      <path d="M14 4h4v13h-4V4Z" />
      <path d="M8 4h4v13H8V4Z" />
      <path d="M36 4c4 4 5 9.5 2 16h-5.2C30.8 13.5 31.9 8 36 4Z" />
      <path d="M20 22h8v6h-8v-6Z" />
      <path d="M20 28h8v3h-8v-3Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

const categoryIconsById = {
  [CATEGORY_IDS.surfaces]: SurfaceCategoryIcon,
  [CATEGORY_IDS.beerTap]: BeerCategoryIcon,
  [CATEGORY_IDS.bread]: BreadCategoryIcon,
  [CATEGORY_IDS.cutlery]: CutleryCategoryIcon,
  [CATEGORY_IDS.glasses]: GlassesCategoryIcon,
  [CATEGORY_IDS.coffee]: CoffeeCategoryIcon,
  [CATEGORY_IDS.ketchup]: KetchupCategoryIcon,
  [CATEGORY_IDS.floor]: FloorCategoryIcon,
  [CATEGORY_IDS.dates]: DatesCategoryIcon,
  [CATEGORY_IDS.trash]: TrashCategoryIcon,
  [CATEGORY_IDS.finalCheck]: FinalCheckCategoryIcon,
}

const taskIconsById = {
  [TASK_IDS.waterBottlesArea]: BottleIcon,
  [TASK_IDS.drinkPreparationArea]: PrepCounterIcon,
  [TASK_IDS.coffeeMachineArea]: CoffeeAreaIcon,
  [TASK_IDS.beerArea]: BeerAreaIcon,
  [TASK_IDS.breadCuttingArea]: BreadCuttingAreaIcon,
  [TASK_IDS.cutleryArea]: CutleryAreaIcon,
  [TASK_IDS.breadStackArea]: BreadStackIcon,
  [TASK_IDS.tapPipes]: TapPipesIcon,
  [TASK_IDS.cleanTray]: BeerNetDishwasherIcon,
  [TASK_IDS.sink]: BeerBasinIcon,
  [TASK_IDS.replaceTray]: BeerNetReturnIcon,
  [TASK_IDS.beerTower]: BeerTapWipeIcon,
  [TASK_IDS.fondue]: FondueIcon,
  [TASK_IDS.preCutSlices]: BreadSliceIcon,
  [TASK_IDS.wholeBreads]: WholeBreadIcon,
  [TASK_IDS.leftoverBreadContainer]: BreadContainerIcon,
  [TASK_IDS.cuttingBoardKnife]: CuttingBoardKnifeIcon,
  [TASK_IDS.drawerContainers]: CrumbDrawerIcon,
  [TASK_IDS.baskets]: BasketStackIcon,
  [TASK_IDS.soupPot]: SoupPotIcon,
  [TASK_IDS.cutlery]: CutleryTaskIcon,
  [TASK_IDS.glassStations]: GlassStationIcon,
  [TASK_IDS.glasses]: PolishGlassesIcon,
  [TASK_IDS.milk]: MilkIcon,
  [TASK_IDS.milkPipe]: MilkPipeIcon,
  [TASK_IDS.smallTablet]: TabletIcon,
  [TASK_IDS.cleaningCycle1]: CycleOneIcon,
  [TASK_IDS.nozzlesCover]: NozzlesCoverIcon,
  [TASK_IDS.cleaningCycle2]: CycleTwoIcon,
  [TASK_IDS.groundsContainer]: GroundsIcon,
  [TASK_IDS.turnOffCoffeeMachine]: PowerOffIcon,
  [TASK_IDS.sealKetchupMayo]: KetchupCategoryIcon,
  [TASK_IDS.dryBroom]: BroomIcon,
  [TASK_IDS.detergentWater]: DetergentWaterIcon,
  [TASK_IDS.wetBrush]: WetBrushIcon,
  [TASK_IDS.squeegee]: SqueegeeIcon,
  [TASK_IDS.mopToDry]: MopIcon,
  [TASK_IDS.butter]: ButterIcon,
  [TASK_IDS.redWines]: WineBottleIcon,
  [TASK_IDS.whiteWines]: WhiteWineIcon,
  [TASK_IDS.rose]: RoseWineIcon,
  [TASK_IDS.juices]: JuiceIcon,
  [TASK_IDS.milkCarton]: MilkCartonIcon,
  [TASK_IDS.officeTrash]: OfficeTrashIcon,
  [TASK_IDS.restaurantLobbyTrash]: LobbyTrashIcon,
  [TASK_IDS.upperSurfaces]: UpperSurfaceIcon,
  [TASK_IDS.staffDrinks]: StaffDrinksIcon,
  [TASK_IDS.staffFood]: StaffFoodIcon,
}

export function getCategoryIcon(categoryId) {
  return categoryIconsById[categoryId] ?? DefaultTaskIcon
}

export function getTaskIcon(taskId) {
  return taskIconsById[taskId] ?? DefaultTaskIcon
}
