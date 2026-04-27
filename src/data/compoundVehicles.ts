/**
 * @fileOverview Data definitions for the Compound Clicker game.
 * Contains the progression of financial vehicles.
 */

export type VehicleId = 'piggy' | 'savings' | 'deposit' | 'index' | 'stocks' | 'property';

export interface Vehicle {
  id: VehicleId;
  name: string;
  description: string;
  unlockCost: number;
  annualReturnRate: number;
  clickMultiplier: number;
  colour: string;
}

export const COMPOUND_VEHICLES: Vehicle[] = [
  {
    id: 'piggy',
    name: 'Piggy Bank',
    description: 'Money is safe but doesn\'t grow at all.',
    unlockCost: 0,
    annualReturnRate: 0,
    clickMultiplier: 1,
    colour: 'bg-rose-400',
  },
  {
    id: 'savings',
    name: 'Savings Account',
    description: 'The bank pays you a little interest for keeping your money there.',
    unlockCost: 50,
    annualReturnRate: 0.02,
    clickMultiplier: 2,
    colour: 'bg-blue-400',
  },
  {
    id: 'deposit',
    name: 'Fixed Deposit',
    description: 'Lock your money away for a set time to earn higher returns.',
    unlockCost: 200,
    annualReturnRate: 0.04,
    clickMultiplier: 3,
    colour: 'bg-primary',
  },
  {
    id: 'index',
    name: 'Index Fund',
    description: 'Own tiny pieces of hundreds of top companies at once.',
    unlockCost: 500,
    annualReturnRate: 0.07,
    clickMultiplier: 5,
    colour: 'bg-[#4EA07A]',
  },
  {
    id: 'stocks',
    name: 'Stock Portfolio',
    description: 'Hand-picked companies. Higher risk but much higher growth potential.',
    unlockCost: 1500,
    annualReturnRate: 0.10,
    clickMultiplier: 8,
    colour: 'bg-primary',
  },
  {
    id: 'property',
    name: 'Property',
    description: 'Real estate that grows in value and earns monthly rent.',
    unlockCost: 5000,
    annualReturnRate: 0.06,
    clickMultiplier: 6,
    colour: 'bg-[#4EA07A]',
  }
];
