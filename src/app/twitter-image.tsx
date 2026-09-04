import { ImageResponse } from 'next/og';

export const alt = "Prosperify - L'agent de recherche pour les documents de votre métier";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const Image = async () => {
  const interSemiBold = fetch('https://fonts.googleapis.com/css2?family=Inter:wght@600')
    .then((res) => res.text())
    .then(
      (css) =>
        /src:\s*url\(([^)]+)\)/.exec(css)?.[1] ??
        'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_fhQt7Cp_0.woff2',
    )
    .then((url) => fetch(url))
    .then((res) => res.arrayBuffer());

  const interBold = fetch('https://fonts.googleapis.com/css2?family=Inter:wght@700')
    .then((res) => res.text())
    .then(
      (css) =>
        /src:\s*url\(([^)]+)\)/.exec(css)?.[1] ??
        'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_fhQt7Cp_0.woff2',
    )
    .then((url) => fetch(url))
    .then((res) => res.arrayBuffer());

  const [semiBoldData, boldData] = await Promise.all([interSemiBold, interBold]);

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0c0c0d 0%, #1a1a2e 50%, #2d1b00 100%)',
        color: 'white',
        padding: '60px 80px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            background: '#ff6a13',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 800,
            color: 'white',
          }}
        >
          P
        </div>
        <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.5 }}>Prosperify</span>
      </div>
      <h1
        style={{
          fontSize: 58,
          fontWeight: 800,
          textAlign: 'center',
          lineHeight: 1.1,
          margin: '0 0 8px',
          maxWidth: 900,
          letterSpacing: -2,
        }}
      >
        L&apos;agent de recherche <span style={{ color: '#ff6a13' }}>de vos documents</span>
      </h1>
      <p
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: '#a0a0a0',
          textAlign: 'center',
          margin: 0,
          maxWidth: 700,
          lineHeight: 1.4,
        }}
      >
        Jamais entraîné sur vos données, pour le droit, la finance et la santé
        {'\n'}réponses citées à la page, déploiement dans votre périmètre
      </p>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: semiBoldData,
          weight: 600,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: boldData,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  );
};

export default Image;
