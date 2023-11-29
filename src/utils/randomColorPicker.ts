export const randomColorPick = () => {
  const colorArr = [
    '#34dbeb',
    '#7076ff',
    '#40aef4',
    '#6ace6e',
    '#ffab60',
    '#ff5b67',
    '#a259ff',
    '#ffa325',
  ];
  const randomIndex = Math.floor(Math.random() * colorArr.length);

  return colorArr[randomIndex];
};
