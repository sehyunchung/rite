// Use adapter for backward compatibility with Typography API
export { Typography } from './typography-adapter'
export type { TypographyProps } from './typography-adapter'

// Also export individual text components for direct use
export {
  H1, H2, H3, H4, H5, H6,
  Body, BodyLarge, BodySmall,
  Caption, TextLabel, Text
} from '../text'