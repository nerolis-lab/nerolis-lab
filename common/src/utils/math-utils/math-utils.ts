class MathUtilsImpl {
  public floor(num: number, decimals: number) {
    const factor = Math.pow(10, decimals);
    return Math.floor(num * factor) / factor;
  }

  public ceil(num: number, decimals: number) {
    const factor = Math.pow(10, decimals);
    return Math.ceil(num * factor) / factor;
  }

  public round(num: number, decimals: number) {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  }

  /**
   * @description Floors a number to n decimal places, handling floating-point precision errors.
   * This addresses JavaScript's IEEE 754 floating-point representation issues where
   * operations like 0.83 * 10 = 8.299999999999999 instead of 8.3, or 0.1 + 0.2 = 0.30000000000000004 instead of 0.3.
   *
   * When these precision errors occur, the function detects when the result is very close to an integer
   * (within 1e-10) and corrects it before flooring.
   *
   * @note This floors towards negative infinity, not towards zero.
   * For negative numbers: floor(-2.789, 2) = -2.79
   */
  public floorWithIEEE754Correction(num: number, decimals: number) {
    const factor = Math.pow(10, decimals);
    const shifted = num * factor; // could introduce precision errors

    // Adjusts for precision errors
    const rounded = Math.abs(shifted - Math.round(shifted)) < 1e-10 ? Math.round(shifted) : shifted;

    return Math.floor(rounded) / factor;
  }
}

export const MathUtils = new MathUtilsImpl();
