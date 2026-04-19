export interface ThemeMeta {
  id: string
  displayName: Record<string, string>
  description: Record<string, string>
  preview?: string
  features: {
    hasTexture: boolean
    hasSeal: boolean
    decorativeOrnament: boolean
  }
}
