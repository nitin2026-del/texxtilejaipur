import { v4 as uuidv4 } from 'uuid';
export const trackMetaEvent = async (
  eventName: string,
  eventData: Record<string, unknown> = {},
  eventId?: string,
  skipCapi: boolean = false
) => {
  const id = eventId || uuidv4();
  
  // 1. Send via Browser Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    console.log(`[Meta Pixel] Firing ${eventName}`, eventData);
    (window as any).fbq('track', eventName, eventData, { eventID: id });
  } else if (typeof window !== 'undefined') {
    console.warn(`[Meta Pixel] fbq not found for ${eventName}`);
  }

  // 2. Send via Server CAPI (by calling our internal API)
  if (typeof window !== 'undefined' && !skipCapi) {
    try {
      await fetch('/api/meta-capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          eventData,
          eventId: id,
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      });
    } catch (err) {
      console.error('CAPI forwarding failed', err);
    }
  }
  
  return id;
};
