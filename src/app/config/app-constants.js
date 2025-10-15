import { GENERATED_LANGUAGES } from './auto-generated-languages.js';
import { deepFreeze } from '../../utils/helpers.js';

/**
 * @typedef {Object} RGB
 * @property {number} r - Red component (0–255).
 * @property {number} g - Green component (0–255).
 * @property {number} b - Blue component (0–255).
 */

/**
 * @typedef {Object} ColorDefinition
 * @property {number} id - Unique numeric identifier of the color.
 * @property {string} name - Human-readable color name.
 * @property {RGB} rgb - RGB components of the color.
 */

/**
 * Map of all available colors used in the application.
 * The key corresponds to the color ID, and the value describes its properties.
 *
 * @type {Record<number, ColorDefinition>}
 */
const COLOR_MAP = {
  0: { id: 0, name: 'Transparent', rgb: { r: 222, g: 250, b: 206 } }, // deface
  1: { id: 1, name: 'Black', rgb: { r: 0, g: 0, b: 0 } },
  2: { id: 2, name: 'Dark Gray', rgb: { r: 60, g: 60, b: 60 } },
  3: { id: 3, name: 'Gray', rgb: { r: 120, g: 120, b: 120 } },
  4: { id: 4, name: 'Light Gray', rgb: { r: 210, g: 210, b: 210 } },
  5: { id: 5, name: 'White', rgb: { r: 255, g: 255, b: 255 } },
  6: { id: 6, name: 'Deep Red', rgb: { r: 96, g: 0, b: 24 } },
  7: { id: 7, name: 'Red', rgb: { r: 237, g: 28, b: 36 } },
  8: { id: 8, name: 'Orange', rgb: { r: 255, g: 127, b: 39 } },
  9: { id: 9, name: 'Gold', rgb: { r: 246, g: 170, b: 9 } },
  10: { id: 10, name: 'Yellow', rgb: { r: 249, g: 221, b: 59 } },
  11: { id: 11, name: 'Light Yellow', rgb: { r: 255, g: 250, b: 188 } },
  12: { id: 12, name: 'Dark Green', rgb: { r: 14, g: 185, b: 104 } },
  13: { id: 13, name: 'Green', rgb: { r: 19, g: 230, b: 123 } },
  14: { id: 14, name: 'Light Green', rgb: { r: 135, g: 255, b: 94 } },
  15: { id: 15, name: 'Dark Teal', rgb: { r: 12, g: 129, b: 110 } },
  16: { id: 16, name: 'Teal', rgb: { r: 16, g: 174, b: 166 } },
  17: { id: 17, name: 'Light Teal', rgb: { r: 19, g: 225, b: 190 } },
  18: { id: 18, name: 'Dark Blue', rgb: { r: 40, g: 80, b: 158 } },
  19: { id: 19, name: 'Blue', rgb: { r: 64, g: 147, b: 228 } },
  20: { id: 20, name: 'Cyan', rgb: { r: 96, g: 247, b: 242 } },
  21: { id: 21, name: 'Indigo', rgb: { r: 107, g: 80, b: 246 } },
  22: { id: 22, name: 'Light Indigo', rgb: { r: 153, g: 177, b: 251 } },
  23: { id: 23, name: 'Dark Purple', rgb: { r: 120, g: 12, b: 153 } },
  24: { id: 24, name: 'Purple', rgb: { r: 170, g: 56, b: 185 } },
  25: { id: 25, name: 'Light Purple', rgb: { r: 224, g: 159, b: 249 } },
  26: { id: 26, name: 'Dark Pink', rgb: { r: 203, g: 0, b: 122 } },
  27: { id: 27, name: 'Pink', rgb: { r: 236, g: 31, b: 128 } },
  28: { id: 28, name: 'Light Pink', rgb: { r: 243, g: 141, b: 169 } },
  29: { id: 29, name: 'Dark Brown', rgb: { r: 104, g: 70, b: 52 } },
  30: { id: 30, name: 'Brown', rgb: { r: 149, g: 104, b: 42 } },
  31: { id: 31, name: 'Beige', rgb: { r: 248, g: 178, b: 119 } },
  32: { id: 32, name: 'Medium Gray', rgb: { r: 170, g: 170, b: 170 } },
  33: { id: 33, name: 'Dark Red', rgb: { r: 165, g: 14, b: 30 } },
  34: { id: 34, name: 'Light Red', rgb: { r: 250, g: 128, b: 114 } },
  35: { id: 35, name: 'Dark Orange', rgb: { r: 228, g: 92, b: 26 } },
  36: { id: 36, name: 'Light Tan', rgb: { r: 214, g: 181, b: 148 } },
  37: { id: 37, name: 'Dark Goldenrod', rgb: { r: 156, g: 132, b: 49 } },
  38: { id: 38, name: 'Goldenrod', rgb: { r: 197, g: 173, b: 49 } },
  39: { id: 39, name: 'Light Goldenrod', rgb: { r: 232, g: 212, b: 95 } },
  40: { id: 40, name: 'Dark Olive', rgb: { r: 74, g: 107, b: 58 } },
  41: { id: 41, name: 'Olive', rgb: { r: 90, g: 148, b: 74 } },
  42: { id: 42, name: 'Light Olive', rgb: { r: 132, g: 197, b: 115 } },
  43: { id: 43, name: 'Dark Cyan', rgb: { r: 15, g: 121, b: 159 } },
  44: { id: 44, name: 'Light Cyan', rgb: { r: 187, g: 250, b: 242 } },
  45: { id: 45, name: 'Light Blue', rgb: { r: 125, g: 199, b: 255 } },
  46: { id: 46, name: 'Dark Indigo', rgb: { r: 77, g: 49, b: 184 } },
  47: { id: 47, name: 'Dark Slate Blue', rgb: { r: 74, g: 66, b: 132 } },
  48: { id: 48, name: 'Slate Blue', rgb: { r: 122, g: 113, b: 196 } },
  49: { id: 49, name: 'Light Slate Blue', rgb: { r: 181, g: 174, b: 241 } },
  50: { id: 50, name: 'Light Brown', rgb: { r: 219, g: 164, b: 99 } },
  51: { id: 51, name: 'Dark Beige', rgb: { r: 209, g: 128, b: 81 } },
  52: { id: 52, name: 'Light Beige', rgb: { r: 255, g: 197, b: 165 } },
  53: { id: 53, name: 'Dark Peach', rgb: { r: 155, g: 82, b: 73 } },
  54: { id: 54, name: 'Peach', rgb: { r: 209, g: 128, b: 120 } },
  55: { id: 55, name: 'Light Peach', rgb: { r: 250, g: 182, b: 164 } },
  56: { id: 56, name: 'Dark Tan', rgb: { r: 123, g: 99, b: 82 } },
  57: { id: 57, name: 'Tan', rgb: { r: 156, g: 132, b: 107 } },
  58: { id: 58, name: 'Dark Slate', rgb: { r: 51, g: 57, b: 65 } },
  59: { id: 59, name: 'Slate', rgb: { r: 109, g: 117, b: 141 } },
  60: { id: 60, name: 'Light Slate', rgb: { r: 179, g: 185, b: 209 } },
  61: { id: 61, name: 'Dark Stone', rgb: { r: 109, g: 100, b: 63 } },
  62: { id: 62, name: 'Stone', rgb: { r: 148, g: 140, b: 107 } },
  63: { id: 63, name: 'Light Stone', rgb: { r: 205, g: 197, b: 158 } },
};

/**
 * Map of packed RGB integer keys to color IDs.
 * Used for fast lookup during pixel analysis and color counting.
 * Key: (r << 16) | (g << 8) | b
 *
 * @type {Map<number, number>}
 */
const RGB_KEY_TO_ID = new Map(
  Object.values(COLOR_MAP).map((c) => [(c.rgb.r << 16) | (c.rgb.g << 8) | c.rgb.b, c.id])
);

/**
 * Enum-like object for color identifiers.
 * Provides readable constant names for color IDs.
 *
 * @readonly
 * @enum {number}
 * @property {number} TRANSPARENT - Color ID 0
 * @property {number} BLACK - Color ID 1
 * @property {number} DARK_GRAY - Color ID 2
 * @property {number} GRAY - Color ID 3
 * @property {number} LIGHT_GRAY - Color ID 4
 * @property {number} WHITE - Color ID 5
 * @property {number} DEEP_RED - Color ID 6
 * @property {number} RED - Color ID 7
 * @property {number} ORANGE - Color ID 8
 * @property {number} GOLD - Color ID 9
 * @property {number} YELLOW - Color ID 10
 * @property {number} LIGHT_YELLOW - Color ID 11
 * @property {number} DARK_GREEN - Color ID 12
 * @property {number} GREEN - Color ID 13
 * @property {number} LIGHT_GREEN - Color ID 14
 * @property {number} DARK_TEAL - Color ID 15
 * @property {number} TEAL - Color ID 16
 * @property {number} LIGHT_TEAL - Color ID 17
 * @property {number} DARK_BLUE - Color ID 18
 * @property {number} BLUE - Color ID 19
 * @property {number} CYAN - Color ID 20
 * @property {number} INDIGO - Color ID 21
 * @property {number} LIGHT_INDIGO - Color ID 22
 * @property {number} DARK_PURPLE - Color ID 23
 * @property {number} PURPLE - Color ID 24
 * @property {number} LIGHT_PURPLE - Color ID 25
 * @property {number} DARK_PINK - Color ID 26
 * @property {number} PINK - Color ID 27
 * @property {number} LIGHT_PINK - Color ID 28
 * @property {number} DARK_BROWN - Color ID 29
 * @property {number} BROWN - Color ID 30
 * @property {number} BEIGE - Color ID 31
 * @property {number} MEDIUM_GRAY - Color ID 32
 * @property {number} DARK_RED_ALT - Color ID 33
 * @property {number} LIGHT_RED - Color ID 34
 * @property {number} DARK_ORANGE - Color ID 35
 * @property {number} LIGHT_TAN - Color ID 36
 * @property {number} DARK_GOLDENROD - Color ID 37
 * @property {number} GOLDENROD - Color ID 38
 * @property {number} LIGHT_GOLDENROD - Color ID 39
 * @property {number} DARK_OLIVE - Color ID 40
 * @property {number} OLIVE - Color ID 41
 * @property {number} LIGHT_OLIVE - Color ID 42
 * @property {number} DARK_CYAN - Color ID 43
 * @property {number} LIGHT_CYAN - Color ID 44
 * @property {number} LIGHT_BLUE - Color ID 45
 * @property {number} DARK_INDIGO_ALT - Color ID 46
 * @property {number} DARK_SLATE_BLUE - Color ID 47
 * @property {number} SLATE_BLUE - Color ID 48
 * @property {number} LIGHT_SLATE_BLUE - Color ID 49
 * @property {number} LIGHT_BROWN - Color ID 50
 * @property {number} DARK_BEIGE - Color ID 51
 * @property {number} LIGHT_BEIGE - Color ID 52
 * @property {number} DARK_PEACH - Color ID 53
 * @property {number} PEACH - Color ID 54
 * @property {number} LIGHT_PEACH - Color ID 55
 * @property {number} DARK_TAN - Color ID 56
 * @property {number} TAN - Color ID 57
 * @property {number} DARK_SLATE - Color ID 58
 * @property {number} SLATE - Color ID 59
 * @property {number} LIGHT_SLATE - Color ID 60
 * @property {number} DARK_STONE - Color ID 61
 * @property {number} STONE - Color ID 62
 * @property {number} LIGHT_STONE - Color ID 63
 */
export const COLOR_IDS = deepFreeze(
  Object.fromEntries(
    Object.values(COLOR_MAP).map((color) => [
      color.name.toUpperCase().replace(/\s+/g, '_'),
      color.id,
    ])
  )
);

/**
 * Numeric key of the transparent color in the format (r << 16) | (g << 8) | b.
 * Used to maintain consistent color identification between image-related functions.
 *
 * @constant
 * @type {number}
 */
const TRANSPARENT_COLOR_KEY =
  (COLOR_MAP[0].rgb.r << 16) | (COLOR_MAP[0].rgb.g << 8) | COLOR_MAP[0].rgb.b;

/**
 * @typedef {Object} ThemeDefinition
 * @property {string} name - Display name of the theme.
 * @property {string} cssClass - Associated CSS class name applied to the app root element.
 */

/**
 * @typedef {Object} PaintingSpeedRange
 * @property {number} MIN - Minimum allowed painting speed.
 * @property {number} MAX - Maximum allowed painting speed.
 */

/**
 * Main application-level constants used throughout the project.
 * Includes configuration for languages, themes, color palette, and more.
 *
 * @namespace APP_CONSTANTS
 * @property {string[]} LANGUAGES - Auto-generated list of supported languages.
 * @property {PaintingSpeedRange} PAINTING_SPEED - Minimum and maximum speed limits for painting logic.
 * @property {Record<string, ThemeDefinition>} THEMES - Available UI themes and their CSS class mappings.
 * @property {Record<number, ColorDefinition>} COLOR_MAP - Color lookup table.
 * @property {typeof COLOR_IDS} COLOR_IDS - Enum-like object for color IDs.
 * @property {number} TRANSPARENT_COLOR_KEY - Packed RGB key for the transparent color.
 * @property {Map<number, number>} RGB_KEY_TO_ID - Lookup map of RGB integer keys to color IDs.
 */
export const APP_CONSTANTS = {
  LANGUAGES: GENERATED_LANGUAGES,
  PAINTING_SPEED: {
    MIN: 1,
    MAX: 1000,
  },
  THEMES: {
    classic: { name: 'Classic', cssClass: 'wplace-theme-classic' },
    'classic-light': { name: 'Classic Light', cssClass: 'wplace-theme-classic-light' },
    'neon-retro': { name: 'Neon Retro', cssClass: 'wplace-theme-neon' },
  },
  COLOR_MAP,
  COLOR_IDS,
  TRANSPARENT_COLOR_KEY,
  RGB_KEY_TO_ID,
};
