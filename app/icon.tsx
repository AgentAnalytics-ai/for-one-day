import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 48,
  height: 48,
}
export const contentType = 'image/png'

const NAVY = '#102A43'
const AMBER = '#D97706'
const WHITE = '#ffffff'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: WHITE,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: NAVY,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 6.5,
              left: 11.3,
              width: 4.2,
              height: 4.2,
              borderRadius: 999,
              background: AMBER,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 13.5,
              width: 12.5,
              height: 1.9,
              borderRadius: 999,
              background: WHITE,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 16.7,
              width: 9,
              height: 1.3,
              borderRadius: 999,
              background: WHITE,
              opacity: 0.5,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
