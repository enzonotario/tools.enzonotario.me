declare module 'jstoxml' {
  interface ToXMLOptions {
    header?: boolean | string
    indent?: string | number
    filter?: (value: unknown) => boolean
  }

  function toXML(obj: unknown, options?: ToXMLOptions): string

  export { toXML, type ToXMLOptions }
  export default toXML
}
