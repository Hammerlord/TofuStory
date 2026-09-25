import { createContext, RefObject } from "react";

export const ProjectileLayerContext = createContext<RefObject<HTMLElement | null> | null>(null);