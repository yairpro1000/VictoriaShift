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
    <svg viewBox="0 0 48 48" {...props}>
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
      <path d="M9 26h30v13H9V26Z" />
      <path d="M14 17h20l5 9H9l5-9Z" />
      <path d="M16 30h16v4H16v-4Z" fill="var(--icon-cutout)" />
      <path d="M33 9l2-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" />
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
      <path d="M7 24c0-8 7-14 17-14s17 6 17 14v12c0 3-2 5-5 5H12c-3 0-5-2-5-5V24Z" />
      <path d="M14 22c2-4 5-6 9-7" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="3.6" />
      <path d="M25 15c4 1 7 3 9 7" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="3.6" />
      <path d="M13 31h22v4H13v-4Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function CutleryCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M11 6h4v15h3V6h4v15h3V6h4v18c0 4-3 7-7 8v11h-7V32c-4-1-8-4-8-8V6Z" />
      <path d="M34 7c5 4 7 10 5 18l-2 8h-6l2-9c-4-2-5-8 1-17Z" />
    </svg>
  )
}

function GlassesCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M12 7h11l-2 22c-.3 4-2.8 7-6.5 7S8.3 33 8 29L6 7h6Z" />
      <path d="M15 36h2v5h6v4H6v-4h7v-5h2Z" />
      <path d="M29 7h13l-3 27c-.4 4-2.5 7-6.5 7s-6.1-3-6.5-7L23 7h6Z" />
      <path d="M10 13h9v3h-9v-3Z" fill="var(--icon-cutout)" />
      <path d="M28 13h10v3H28v-3Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function CoffeeCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M8 9h28v27c0 4-3 7-7 7H15c-4 0-7-3-7-7V9Z" />
      <path d="M36 16h5c3 0 5 2 5 5v7c0 3-2 5-5 5h-5v-6h4v-5h-4v-6Z" />
      <path d="M14 15h16v5H14v-5Z" fill="var(--icon-cutout)" />
      <path d="M15 29h14v4H15v-4Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function KetchupCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M17 4h14v8l-3 6v23c0 3-2 5-5 5h-3c-3 0-5-2-5-5V18l-3-6V4h5Z" />
      <path d="M27 18h7c4 0 7 3 7 7v16h-8V27c0-1-1-2-2-2h-4v-7Z" />
      <path d="M18 24h7v12h-7V24Z" fill="var(--icon-cutout)" />
      <path d="M14 7h16v4H14V7Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function FloorCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M22 4h6v27h-6V4Z" />
      <path d="M12 30h26l4 13H8l4-13Z" />
      <path d="M15 35h20v3H15v-3Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function DatesCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M11 7h25c3 0 5 2 5 5v26c0 3-2 5-5 5H11c-3 0-5-2-5-5V12c0-3 2-5 5-5Z" />
      <path d="M6 16h35v5H6v-5Z" fill="var(--icon-cutout)" />
      <path d="M14 4h5v8h-5V4Z" fill="var(--icon-cutout)" />
      <path d="M29 4h5v8h-5V4Z" fill="var(--icon-cutout)" />
      <path d="M27 26l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function TrashCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M15 14h22l-2 28H17L15 14Z" />
      <path d="M12 9h28v6H12V9Z" />
      <path d="M20 4h12v6H20V4Z" />
      <path d="M21 20h3v17h-3V20Z" fill="var(--icon-cutout)" />
      <path d="M29 20h3v17h-3V20Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function FinalCheckCategoryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M24 3l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1 5-11Z" />
      <path d="M16 38h16v6H16v-6Z" />
      <path d="M17 23l5 5 10-12" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
    </svg>
  )
}

function BottleIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M17 4h14v8l-4 7v22c0 3-2 5-5 5s-5-2-5-5V19l-4-7V4h4Z" />
      <path d="M16 8h16v4H16V8Z" fill="var(--icon-cutout)" />
      <path d="M18 25h8v12h-8V25Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function PrepCounterIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M8 22h32v19H8V22Z" />
      <path d="M13 13h22l5 9H8l5-9Z" />
      <path d="M14 27h20v4H14v-4Z" fill="var(--icon-cutout)" />
      <path d="M16 34h8v4h-8v-4Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function CoffeeAreaIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M8 13h25v25c0 4-3 7-7 7H15c-4 0-7-3-7-7V13Z" />
      <path d="M33 19h5c3 0 5 2 5 5v6c0 3-2 5-5 5h-5v-6h4v-4h-4v-6Z" />
      <path d="M14 20h13v4H14v-4Z" fill="var(--icon-cutout)" />
      <path d="M16 3c-2 2-2 5 0 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      <path d="M25 3c-2 2-2 5 0 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
    </svg>
  )
}

function BeerAreaIcon(props) {
  return <BeerCategoryIcon {...props} />
}

function BreadCuttingAreaIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M6 25h24c7 0 12 4 12 10v5H6V25Z" />
      <path d="M16 8h7v22h-7V8Z" />
      <path d="M24 6l17 16-5 5-17-16 5-5Z" />
      <path d="M12 32h20v4H12v-4Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function CutleryAreaIcon(props) {
  return <CutleryCategoryIcon {...props} />
}

function BreadStackIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M9 10h30v8H9v-8Z" />
      <path d="M6 20h36v8H6v-8Z" />
      <path d="M10 30h28v9H10v-9Z" />
      <path d="M14 13h20v2.5H14V13Z" fill="var(--icon-cutout)" />
      <path d="M13 23h22v2.5H13V23Z" fill="var(--icon-cutout)" />
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
      <path d="M14.5 7.5c-1.8 2.2-1.8 4.9 0 7.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.6" />
      <path d="M24 5.5c-2 2.6-2 5.8 0 8.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.6" />
      <path d="M33.5 7.5c-1.8 2.2-1.8 4.9 0 7.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.6" />
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
      <path d="M11 18h26l-4 18H15l-4-18Z" />
      <path d="M8 15h32v6H8v-6Z" />
      <path d="M16 36h5v8h-5v-8Z" />
      <path d="M27 36h5v8h-5v-8Z" />
      <path d="M17 9c-2 2-2 4 0 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
      <path d="M25 7c-2 2-2 5 0 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
      <path d="M33 9c-2 2-2 4 0 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
      <path d="M17 24h14v4H17v-4Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function BreadSliceIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M11 19c0-8 6-13 13-13s13 5 13 13v19c0 3-2 5-5 5H16c-3 0-5-2-5-5V19Z" />
      <path d="M17 24c3-4 7-6 13-6" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="4" />
      <path d="M17 33h14v4H17v-4Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function WholeBreadIcon(props) {
  return <BreadCategoryIcon {...props} />
}

function BreadContainerIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M7 17h34v24H7V17Z" />
      <path d="M12 10h24v9H12v-9Z" />
      <path d="M14 24h20v4H14v-4Z" fill="var(--icon-cutout)" />
      <path d="M14 32h12v4H14v-4Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function CuttingBoardKnifeIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M8 11h22c3 0 5 2 5 5v22c0 3-2 5-5 5H8V11Z" />
      <path d="M31 6l14 14-5 5L26 11l5-5Z" />
      <path d="M14 18h10v4H14v-4Z" fill="var(--icon-cutout)" />
      <path d="M14 29h15v4H14v-4Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function CrumbDrawerIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M7 15h34v26H7V15Z" />
      <path d="M12 10h24v8H12v-8Z" />
      <path d="M15 25h18v4H15v-4Z" fill="var(--icon-cutout)" />
      <path d="M16 35a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="var(--icon-cutout)" />
      <path d="M25 36a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="var(--icon-cutout)" />
      <path d="M32 34a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function BasketStackIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M8 20h32l-4 20H12L8 20Z" />
      <path d="M14 11h20l4 10H10l4-10Z" />
      <path d="M14 25h20v3H14v-3Z" fill="var(--icon-cutout)" />
      <path d="M15 32h18v3H15v-3Z" fill="var(--icon-cutout)" />
      <path d="M18 22l2 17h-3l-2-17h3Z" fill="var(--icon-cutout)" />
      <path d="M30 22l-2 17h3l2-17h-3Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function SoupPotIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M12 18h24v22H12V18Z" />
      <path d="M8 15h32v6H8v-6Z" />
      <path d="M14 10h20v6H14v-6Z" />
      <path d="M9 24H3v9h6v-9Z" />
      <path d="M45 24h-6v9h6v-9Z" />
      <path d="M18 5c-2 2-2 4 0 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
      <path d="M27 4c-2 2-2 5 0 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
    </svg>
  )
}

function CutleryTaskIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M10 6h4v15h3V6h4v15h3V6h4v18c0 4-3 7-7 8v11h-7V32c-4-1-8-4-8-8V6Z" />
      <path d="M31 36l3-3 4 4 6-11 4 2-8 17-9-9Z" />
      <path d="M34 8l2-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" />
    </svg>
  )
}

function GlassStationIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M9 9h12l-2 24c-.3 4-2.5 7-6 7s-5.7-3-6-7L5 9h4Z" />
      <path d="M13 40h2v5H6v-5h7Z" />
      <path d="M28 7h14l-3 28c-.4 4-2.8 7-7 7s-6.6-3-7-7L22 7h6Z" />
      <path d="M8 16h10v3H8v-3Z" fill="var(--icon-cutout)" />
      <path d="M27 15h11v3H27v-3Z" fill="var(--icon-cutout)" />
      <path d="M35 2l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" />
    </svg>
  )
}

function PolishGlassesIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M14 7h20l-3 25c-.4 4-3 7-7 7s-6.6-3-7-7L14 7Z" />
      <path d="M24 39h3v5h8v4H13v-4h8v-5h3Z" />
      <path d="M18 14h12v3H18v-3Z" fill="var(--icon-cutout)" />
      <path d="M11 26l2-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" />
    </svg>
  )
}

function MilkIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M15 4h16v9l5 6v23c0 3-2 5-5 5H15c-3 0-5-2-5-5V19l5-6V4Z" />
      <path d="M16 8h14v4H16V8Z" fill="var(--icon-cutout)" />
      <path d="M15 24h16v13H15V24Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function MilkPipeIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M9 12h19c6 0 10 4 10 10v8h-8v-7c0-2-1-3-3-3H9v-8Z" />
      <path d="M29 29h14v14H29V29Z" />
      <path d="M34 33h4v6h-4v-6Z" fill="var(--icon-cutout)" />
      <path d="M12 24h5v18h-5V24Z" />
    </svg>
  )
}

function TabletIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M16 5h16c5 0 9 4 9 9v20c0 5-4 9-9 9H16c-5 0-9-4-9-9V14c0-5 4-9 9-9Z" />
      <path d="M12 24h24v4H12v-4Z" fill="var(--icon-cutout)" />
      <path d="M24 9v30" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="4" />
    </svg>
  )
}

function CycleOneIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M24 6a17 17 0 1 0 15 9h5l-8-9-8 9h5a10 10 0 1 1-9-4V6Z" />
      <path d="M22 17h5v18h-5V17Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function NozzlesCoverIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M10 8h28v10H10V8Z" />
      <path d="M14 18h8v22h-8V18Z" />
      <path d="M26 18h8v22h-8V18Z" />
      <path d="M12 40h24v5H12v-5Z" />
      <path d="M18 23h3v12h-3V23Z" fill="var(--icon-cutout)" />
      <path d="M30 23h3v12h-3V23Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function CycleTwoIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M24 6a17 17 0 1 0 15 9h5l-8-9-8 9h5a10 10 0 1 1-9-4V6Z" />
      <path d="M18 19h8v5h-5v4h5v5h-12v-8c0-3 2-6 4-6Z" fill="var(--icon-cutout)" />
      <path d="M28 19h6v14h-6V19Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function GroundsIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M12 15h24l-3 28H15l-3-28Z" />
      <path d="M9 10h30v7H9v-7Z" />
      <path d="M17 23h14v4H17v-4Z" fill="var(--icon-cutout)" />
      <path d="M18 35a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="var(--icon-cutout)" />
      <path d="M25 37a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="var(--icon-cutout)" />
      <path d="M31 34a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function PowerOffIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M21 4h6v20h-6V4Z" />
      <path d="M16 10C9 13 5 20 5 28c0 11 8 19 19 19s19-8 19-19c0-8-4-15-11-18v8c3 2 5 6 5 10 0 7-5 12-13 12S11 35 11 28c0-4 2-8 5-10v-8Z" />
    </svg>
  )
}

function BroomIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M29 3h6v27h-6V3Z" />
      <path d="M19 29h25l2 14H17l2-14Z" />
      <path d="M21 34h20v3H21v-3Z" fill="var(--icon-cutout)" />
      <path d="M11 8l18 18-5 5L6 13l5-5Z" />
    </svg>
  )
}

function DetergentWaterIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M14 6h14v9l5 7v20c0 3-2 5-5 5H14c-3 0-5-2-5-5V22l5-7V6Z" />
      <path d="M15 11h12v4H15v-4Z" fill="var(--icon-cutout)" />
      <path d="M34 14c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11Z" />
      <path d="M14 28h14v10H14V28Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function WetBrushIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M9 31h30v10H9V31Z" />
      <path d="M13 24h22v8H13v-8Z" />
      <path d="M20 5h8v20h-8V5Z" />
      <path d="M13 41h3v5h-3v-5Z" />
      <path d="M21 41h3v5h-3v-5Z" />
      <path d="M29 41h3v5h-3v-5Z" />
      <path d="M36 8c3 4 5 7 5 9a5 5 0 0 1-10 0c0-2 2-5 5-9Z" />
    </svg>
  )
}

function SqueegeeIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M21 4h7v25h-7V4Z" />
      <path d="M7 27h35v8H7v-8Z" />
      <path d="M10 35h29l-4 8H14l-4-8Z" />
      <path d="M14 30h20v2.5H14V30Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function MopIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M21 3h7v27h-7V3Z" />
      <path d="M12 29h25l6 15H6l6-15Z" />
      <path d="M16 32l-4 10" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="3" />
      <path d="M24 32v11" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="3" />
      <path d="M32 32l4 10" fill="none" stroke="var(--icon-cutout)" strokeLinecap="round" strokeWidth="3" />
    </svg>
  )
}

function ButterIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M8 20h29l5 8v13H13l-5-8V20Z" />
      <path d="M13 13h24v8H8l5-8Z" />
      <path d="M16 27h16v5H16v-5Z" fill="var(--icon-cutout)" />
      <path d="M35 5l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" />
    </svg>
  )
}

function WineBottleIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M17 4h14v10l-4 7v20c0 3-2 5-5 5s-5-2-5-5V21l-4-7V4h4Z" />
      <path d="M16 8h16v4H16V8Z" fill="var(--icon-cutout)" />
      <path d="M18 27h8v10h-8V27Z" fill="var(--icon-cutout)" />
      <path d="M32 31l7 7-4 4-7-7 4-4Z" />
    </svg>
  )
}

function WhiteWineIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M17 4h14v10l-4 7v20c0 3-2 5-5 5s-5-2-5-5V21l-4-7V4h4Z" />
      <path d="M18 25h8v14h-8V25Z" fill="var(--icon-cutout)" />
      <path d="M34 8l2-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" />
    </svg>
  )
}

function RoseWineIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M17 4h14v10l-4 7v20c0 3-2 5-5 5s-5-2-5-5V21l-4-7V4h4Z" />
      <path d="M16 27h12v10H16V27Z" fill="var(--icon-cutout)" />
      <path d="M33 26a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
      <path d="M33 30a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function JuiceIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M11 10h26l-3 34H14l-3-34Z" />
      <path d="M9 6h30v6H9V6Z" />
      <path d="M16 20h16v14H16V20Z" fill="var(--icon-cutout)" />
      <path d="M30 4h8v5h-8V4Z" />
    </svg>
  )
}

function MilkCartonIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M11 15h26v29H11V15Z" />
      <path d="M11 15l8-10h18l-8 10H11Z" />
      <path d="M29 15h8l-8-10v10Z" />
      <path d="M16 24h16v12H16V24Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function OfficeTrashIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M14 16h20l-2 26H16l-2-26Z" />
      <path d="M10 11h28v6H10v-6Z" />
      <path d="M18 6h12v6H18V6Z" />
      <path d="M6 29h8v10H6V29Z" />
      <path d="M21 21h3v16h-3V21Z" fill="var(--icon-cutout)" />
      <path d="M28 21h3v16h-3V21Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function LobbyTrashIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M12 15h24l-3 28H15l-3-28Z" />
      <path d="M9 10h30v6H9v-6Z" />
      <path d="M18 5h12v6H18V5Z" />
      <path d="M35 28h8v7h-8v-7Z" />
      <path d="M19 21h3v17h-3V21Z" fill="var(--icon-cutout)" />
      <path d="M27 21h3v17h-3V21Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function UpperSurfaceIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M7 25h34v14H7V25Z" />
      <path d="M12 16h24l5 9H7l5-9Z" />
      <path d="M14 30h18v4H14v-4Z" fill="var(--icon-cutout)" />
      <path d="M34 7l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" />
      <path d="M9 11l2-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" />
    </svg>
  )
}

function StaffDrinksIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M10 11h14l-2 22c-.4 4-2.5 7-6 7s-5.6-3-6-7L8 11h2Z" />
      <path d="M16 40h2v5H8v-5h8Z" />
      <path d="M32 8h8v31c0 4-3 7-7 7s-7-3-7-7V22l6-6V8Z" />
      <path d="M12 17h8v3h-8v-3Z" fill="var(--icon-cutout)" />
      <path d="M31 27h6v10h-6V27Z" fill="var(--icon-cutout)" />
    </svg>
  )
}

function StaffFoodIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M24 8a17 17 0 1 1 0 34 17 17 0 0 1 0-34Z" />
      <path d="M24 15a10 10 0 1 1 0 20 10 10 0 0 1 0-20Z" fill="var(--icon-cutout)" />
      <path d="M14 4h4v12h-4V4Z" />
      <path d="M8 4h4v12H8V4Z" />
      <path d="M36 4c4 4 5 9 2 15h-5c-2-6-1-11 3-15Z" />
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
