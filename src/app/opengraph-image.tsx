import { ImageResponse } from 'next/og';

export const alt = 'PomodoFocus — Minimalist Timer & Ambient Lofi Soundscapes';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#FAF9F6',
                    padding: '80px 96px',
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    position: 'relative',
                }}
            >
                {/* Background ambient radial glow */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-10%',
                        right: '-5%',
                        width: '560px',
                        height: '560px',
                        borderRadius: '9999px',
                        background: 'radial-gradient(circle, rgba(255, 99, 99, 0.12) 0%, rgba(250, 249, 246, 0) 70%)',
                    }}
                />

                {/* Left Column: Brand & Value Prop */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        maxWidth: '680px',
                        zIndex: 10,
                    }}
                >
                    {/* Category Pill */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(255, 99, 99, 0.1)',
                            border: '1px solid rgba(255, 99, 99, 0.25)',
                            color: '#FF6363',
                            fontSize: '15px',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            marginBottom: '28px',
                            alignSelf: 'flex-start',
                        }}
                    >
                        <span
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '9999px',
                                backgroundColor: '#FF6363',
                            }}
                        />
                        Lofi Beats & Deep Work
                    </div>

                    {/* Brand Heading */}
                    <h1
                        style={{
                            fontSize: '68px',
                            fontWeight: 800,
                            letterSpacing: '-0.03em',
                            color: '#1C1917',
                            margin: 0,
                            lineHeight: 1.05,
                        }}
                    >
                        PomodoFocus
                    </h1>

                    {/* Subtitle */}
                    <p
                        style={{
                            fontSize: '24px',
                            lineHeight: 1.45,
                            color: '#78716C',
                            marginTop: '20px',
                            marginBottom: '36px',
                            fontWeight: 500,
                        }}
                    >
                        A refined Pomodoro timer featuring ambient soundscapes, organic dynamic island controls, and distraction-free task flow.
                    </p>

                    {/* Feature badges */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                        }}
                    >
                        {['Lofi Radio 24/7', 'Dynamic Island', 'Focus Presets', 'Task Analytics'].map((feature) => (
                            <div
                                key={feature}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '12px',
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E7E5E4',
                                    color: '#44403C',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                }}
                            >
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Visual Tomato & Timer Mockup */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            width: '280px',
                            height: '280px',
                            borderRadius: '9999px',
                            backgroundColor: '#FFFFFF',
                            border: '2px solid rgba(231, 229, 228, 0.95)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 20px 45px rgba(28, 25, 23, 0.08)',
                            position: 'relative',
                        }}
                    >
                        {/* Little Tomato Leaf Accent */}
                        <div
                            style={{
                                width: '24px',
                                height: '14px',
                                backgroundColor: '#51CF66',
                                borderRadius: '12px 12px 0 0',
                                position: 'absolute',
                                top: '24px',
                            }}
                        />

                        {/* Timer digits */}
                        <span
                            style={{
                                fontSize: '64px',
                                fontWeight: 800,
                                color: '#FF6363',
                                letterSpacing: '-0.02em',
                                fontFamily: 'monospace',
                            }}
                        >
                            25:00
                        </span>

                        {/* Station Tag */}
                        <span
                            style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#A8A29E',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                marginTop: '4px',
                            }}
                        >
                            Chillhop Radio
                        </span>

                        {/* Soundwave Bars Simulation */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: '4px',
                                height: '18px',
                                marginTop: '12px',
                            }}
                        >
                            {[8, 14, 18, 11, 16, 9].map((h, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: '4px',
                                        height: `${h}px`,
                                        backgroundColor: '#FF6363',
                                        borderRadius: '9999px',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
