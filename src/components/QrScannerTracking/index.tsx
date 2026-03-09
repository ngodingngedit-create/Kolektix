// // components/QrScannerTracking/index.tsx (versi sederhana)
// import { Post } from '@/utils/REST';
// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useZxing } from 'react-zxing';
// import _ from 'lodash';

// interface ScannerProps {
//   isOpen: boolean;
//   step: number;
//   setStep: (step: number) => void;
//   setData: (data: any) => void;
//   scanType: 'merchandise';
// }

// const QrScannerTracking = ({ isOpen, step, setStep, setData, scanType }: ScannerProps) => {
//   const requestLock = useRef(false);
  
//   const handleMerchScan = useCallback(
//     _.throttle((decodedText: string) => {
//       if (!requestLock.current) {
//         requestLock.current = true;
        
//         let merchCode = decodedText;
//         if (decodedText.includes('?')) {
//           const urlParams = new URLSearchParams(decodedText.split('?')[1]);
//           merchCode = urlParams.get('code') || decodedText;
//         }
        
//         Post('tracking/order/', { 
//           invoice_no: merchCode,
//           qr_code: merchCode 
//         })
//           .then((res: any) => {
//             console.log('Merch scan response:', res);
            
//             setData({
//               type: 'merchandise',
//               status: res.status,
//               success: res.status || res.success,
//               data: res.data,
//               message: res.message,
//               pickup_status: res.pickup_status,
//               rawResponse: res
//             });
//           })
//           .catch((err: any) => {
//             console.log('Merch scan error:', err);
//             setData({
//               type: 'merchandise',
//               status: false,
//               success: false,
//               error: true,
//               message: 'Gagal memproses QR merchandise',
//               rawError: err
//             });
//           })
//           .finally(() => {
//             requestLock.current = false;
//           });
//       }
//     }, 3000),
//     []
//   );

//   const { ref } = useZxing({
//     onDecodeResult(result) {
//       const decodedText = result.getText();
      
//       if (scanType === 'merchandise') {
//         handleMerchScan(decodedText);
//       }
//     },
//     onError(error) {
//       console.error('Scanner error:', error);
//     },
//     constraints: {
//       video: {
//         facingMode: 'environment',
//         width: { ideal: 1280 },
//         height: { ideal: 720 }
//       }
//     },
//     timeBetweenDecodingAttempts: 300,
//   });

//   if (!isOpen) return null;

//   return (
//     <div className="w-full h-full bg-black">
//       <video 
//         ref={ref as any} // Gunakan type assertion untuk mengatasi error
//         className="w-full h-full object-cover"
//         muted
//         playsInline
//         autoPlay
//       />
//     </div>
//   );
// };

// export default QrScannerTracking;

// components/QrScannerTracking/index.tsx
// import { Post } from '@/utils/REST';
// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useZxing } from 'react-zxing';
// import _ from 'lodash';

// interface ScannerProps {
//   isOpen: boolean;
//   step: number;
//   setStep: (step: number) => void;
//   setData: (data: any) => void;
//   scanType: 'merchandise';
// }

// const QrScannerTracking = ({ isOpen, step, setStep, setData, scanType }: ScannerProps) => {
//   const requestLock = useRef(false);
  
//   const handleMerchScan = useCallback(
//     _.throttle((decodedText: string) => {
//       if (!requestLock.current) {
//         requestLock.current = true;
        
//         let merchCode = decodedText;
//         if (decodedText.includes('?')) {
//           const urlParams = new URLSearchParams(decodedText.split('?')[1]);
//           merchCode = urlParams.get('code') || decodedText;
//         }
        
//         // Tanpa auth token - langsung Post dengan 2 parameter
//         Post('tracking/order/', { 
//           invoice_no: merchCode,
//           qr_code: merchCode 
//         })
//           .then((res: any) => {
//             console.log('Merch scan response:', res);
            
//             setData({
//               type: 'merchandise',
//               status: res.status,
//               success: res.status || res.success,
//               data: res.data,
//               message: res.message,
//               pickup_status: res.pickup_status,
//               rawResponse: res
//             });
//           })
//           .catch((err: any) => {
//             console.log('Merch scan error:', err);
//             setData({
//               type: 'merchandise',
//               status: false,
//               success: false,
//               error: true,
//               message: 'Gagal memproses QR merchandise',
//               rawError: err
//             });
//           })
//           .finally(() => {
//             requestLock.current = false;
//           });
//       }
//     }, 3000),
//     []
//   );

//   const { ref } = useZxing({
//     onDecodeResult(result) {
//       const decodedText = result.getText();
      
//       if (scanType === 'merchandise') {
//         handleMerchScan(decodedText);
//       }
//     },
//     onError(error) {
//       console.error('Scanner error:', error);
//     },
//     constraints: {
//       video: {
//         facingMode: 'environment',
//         width: { ideal: 1280 },
//         height: { ideal: 720 }
//       }
//     },
//     timeBetweenDecodingAttempts: 300,
//   });

//   if (!isOpen) return null;

//   return (
//     <div className="w-full h-full bg-black">
//       <video 
//         ref={ref as any}
//         className="w-full h-full object-cover"
//         muted
//         playsInline
//         autoPlay
//       />
//     </div>
//   );
// };

// export default QrScannerTracking;

// components/QrScannerTracking/index.tsx
// components/QrScannerTracking/index.tsx (versi sederhana)
import { Post } from '@/utils/REST';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useZxing } from 'react-zxing';
import _ from 'lodash';

interface ScannerProps {
  isOpen: boolean;
  step: number;
  setStep: (step: number) => void;
  setData: (data: any) => void;
  scanType: 'merchandise';
}

const QrScannerTracking = ({ isOpen, step, setStep, setData, scanType }: ScannerProps) => {
  const requestLock = useRef(false);
  
  const handleMerchScan = useCallback(
    _.throttle((decodedText: string) => {
      if (!requestLock.current) {
        requestLock.current = true;
        
        let merchCode = decodedText;
        if (decodedText.includes('?')) {
          const urlParams = new URLSearchParams(decodedText.split('?')[1]);
          merchCode = urlParams.get('code') || decodedText;
        }
        
        Post('tracking/order/', { 
          invoice_no: merchCode,
          qr_code: merchCode 
        })
          .then((res: any) => {
            console.log('Merch scan response:', res);
            
            setData({
              type: 'merchandise',
              status: res.status,
              success: res.status || res.success,
              data: res.data,
              message: res.message,
              pickup_status: res.pickup_status,
              rawResponse: res
            });
          })
          .catch((err: any) => {
            console.log('Merch scan error:', err);
            setData({
              type: 'merchandise',
              status: false,
              success: false,
              error: true,
              message: 'Gagal memproses QR merchandise',
              rawError: err
            });
          })
          .finally(() => {
            requestLock.current = false;
          });
      }
    }, 3000),
    []
  );

  const { ref } = useZxing({
    onDecodeResult(result) {
      const decodedText = result.getText();
      
      if (scanType === 'merchandise') {
        handleMerchScan(decodedText);
      }
    },
    onError(error) {
      console.error('Scanner error:', error);
    },
    constraints: {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    },
    timeBetweenDecodingAttempts: 300,
  });

  // Efek untuk memastikan video play
  useEffect(() => {
    if (isOpen && ref && 'current' in ref && ref.current) {
      const video = ref.current;
      if (video) {
        video.play().catch(e => console.log('Auto-play failed:', e));
      }
    }
  }, [isOpen, ref]);

  if (!isOpen) return null;

  return (
    <div className="w-full h-full bg-black">
      <video 
        ref={ref as any}
        className="w-full h-full object-cover"
        muted
        playsInline
        autoPlay
      />
    </div>
  );
};

export default QrScannerTracking;