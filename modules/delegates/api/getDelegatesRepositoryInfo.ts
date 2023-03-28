/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';

export type RepositoryInfo = {
  owner: string;
  repo: string;
  page: string;
  ref: string;
};

export function getDelegatesRepositoryInformation(network: SupportedNetworks): RepositoryInfo {
  const repoMainnet = {
    owner: 'makerdao-dux', //TODO: switch back to makerdao after done testing
    repo: 'community',
    page: 'governance/delegates',
    ref: 'endgame-updates' //TODO: switch to master after testing
  };

  const repoTest = {
    owner: 'makerdao-dux',
    repo: 'voting-delegates',
    page: 'delegates',
    ref: 'master'
  };

  const delegatesRepositoryInfo = network === SupportedNetworks.MAINNET ? repoMainnet : repoTest;
  return delegatesRepositoryInfo;
}
