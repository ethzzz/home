/// <reference types="vite/client" />

/** CSS Modules 类型声明：import styles from './X.module.css' */
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
