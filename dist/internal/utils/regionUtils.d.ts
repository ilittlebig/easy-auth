/**
 *
 *
 * Author: Elias Sjödin
 * Created: 2024-10-17
 */
/**
 *
 *
 * Example usage:
 * const region = getRegion("eu-central-1_XXXXXX");
 * console.log(region); -> "eu-central-1"
 *
 */
export declare const getRegion: (userPoolId: string) => string;
/**
 *
 *
 * Example usage:
 * const userPoolName = getUserPoolName("eu-central-1_XXXXXX");
 * console.log(userPoolName); -> "XXXXXX"
 *
 */
export declare const getUserPoolName: (userPoolId: string) => string;
