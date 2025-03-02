'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { ExplorerLink } from '../cluster/cluster-ui';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { useAceyProgram } from './acey-data-access';
import { AceyCreate, AceyProgram } from './acey-ui';

export default function BasicFeature() {
  const { publicKey } = useWallet();
  const { programId } = useAceyProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Acet"
        subtitle={'Run the program by clicking the "Run program" button.'}
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <AceyCreate />
      </AppHero>
      <AceyProgram />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    </div>
  );
}
