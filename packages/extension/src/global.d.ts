declare const __DEV__: boolean

declare module '*.vue' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: any
  export default component
}
