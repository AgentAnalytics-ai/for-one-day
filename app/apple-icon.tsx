import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

const NAVY = '#102A43'
const AMBER = '#D97706'
const WHITE = '#ffffff'

// Image generation
export default function AppleIcon() {
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
            width: 148,
            height: 148,
            borderRadius: 32,
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
              top: 42,
              left: 67,
              width: 14,
              height: 14,
              borderRadius: 999,
              background: AMBER,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 73,
              width: 64,
              height: 10,
              borderRadius: 999,
              background: WHITE,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 88,
              width: 48,
              height: 7,
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
