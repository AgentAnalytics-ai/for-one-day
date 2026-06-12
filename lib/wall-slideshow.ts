export type WallSlideshowImage = {
  id: string
  url: string
}

export type WallSlideshowPayload = {
  images: WallSlideshowImage[]
  timezone: string
}

export const WALL_SLIDESHOW_INTERVAL_MS = 8000
export const WALL_IDLE_TIMEOUT_MS = 5 * 60 * 1000
