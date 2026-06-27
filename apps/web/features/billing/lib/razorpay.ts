import Razorpay from "razorpay";

/**
 * Returns an instance of the Razorpay client.
 * Uses lazy initialization to prevent Next.js build-time failures
 * if environment variables are not yet defined.
 */
export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) are not defined in the environment."
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}
