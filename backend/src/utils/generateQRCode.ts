import QRCode from 'qrcode';

export const generateQRCode = async (data: string | object): Promise<string> => {
  try {
    const textData = typeof data === 'string' ? data : JSON.stringify(data);
    const qrDataUrl = await QRCode.toDataURL(textData, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (err: any) {
    console.error('Error generating QR Code:', err);
    throw new Error('QR Code generation failed');
  }
};
