/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "framer-motion" {
  import type { ComponentType, PropsWithChildren } from "react";
  export const motion: {
    div: ComponentType<any>;
    span: ComponentType<any>;
    svg: ComponentType<any>;
    [key: string]: ComponentType<any>;
  };
  export const AnimatePresence: ComponentType<PropsWithChildren<any>>;
  export default motion;
}
