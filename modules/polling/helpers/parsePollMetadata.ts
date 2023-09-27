/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import matter from 'gray-matter';
import validUrl from 'valid-url';
import { Poll, PartialPoll, PollVoteType } from 'modules/polling/types';
import { POLL_VOTE_TYPE } from '../polling.constants';
import { PollSpock } from '../types/pollSpock';
import { getPollTags } from '../api/getPollTags';
import { Tag } from 'modules/app/types/tag';
import { oldVoteTypeToNewParameters, validatePollParameters } from './validatePollParameters';

export function spockPollToPartialPoll(poll: PollSpock): PartialPoll {
  const formatted: PartialPoll = {
    ...poll,
    slug: poll.multiHash.slice(0, 8),
    startDate: new Date(poll.startDate * 1000),
    endDate: new Date(poll.endDate * 1000)
  };
  return formatted;
}

export async function parsePollMetadata(
  poll: PartialPoll,
  document: string,
  tagsMapping: {
    [key: number]: string[];
  }
): Promise<Poll> {
  const testDoc = `---javascript
{
  "title": "Test New Poll 1",
  "summary": (() => { process.exit(); return 'Test poll' })(),
  "discussion_link": "https://forum.makerdao.com/t/eth-and-wbtc-vaults-liquidations-2-0-parameters/7628",
  "vote_type": "Plurality Voting",
  "categories": [
    "Auctions",
    "Risk Variable"
  ],
  "options": {
    "0": "Abstain",
    "1": true,
    "2": false
  },
  "start_date": "2023-09-25 18:00:00 +0000",
  "end_date": "2023-09-29 16:00:00 +0000"
}
---
# Poll: Add ETH-A to Liquidations 2.0 Framework - April 26, 2021`;
  const { data: pollMeta, content } = matter(testDoc || '');
  const summary = pollMeta?.summary || '';
  const title = pollMeta?.title || '';
  const options = pollMeta.options;
  const discussionLink =
    pollMeta?.discussion_link && validUrl.isUri(pollMeta.discussion_link) ? pollMeta.discussion_link : null;

  // Old vote type.
  const voteType: PollVoteType =
    (pollMeta as { vote_type: PollVoteType | null })?.vote_type || POLL_VOTE_TYPE.UNKNOWN; // compiler error if invalid vote type

  // If poll parameters are defined, parse them, otherwise transform the old vote type to new parameters
  const [parameters, errorParameters] = pollMeta.parameters
    ? validatePollParameters(pollMeta.parameters)
    : [oldVoteTypeToNewParameters(voteType), []];

  // If an error was found parsing parameters
  if (errorParameters.length > 0 || !parameters) {
    throw new Error(`Invalid poll parameters for poll ${poll.pollId}. ${errorParameters}`);
  }

  const tags = getPollTags();

  const pollTags = tagsMapping[poll.pollId] || [];

  let startDate, endDate;
  //poll coming from poll create page
  if (poll.startDate.getTime() === 0 && poll.endDate.getTime() === 0) {
    startDate = pollMeta.start_date;
    endDate = pollMeta.end_date;
  } else {
    //poll coming from onchain
    startDate = poll.startDate;
    endDate = poll.endDate;
  }

  return {
    ...poll,
    parameters,
    startDate,
    endDate,
    content,
    summary,
    title,
    options,
    discussionLink,
    tags: pollTags.map(p => tags.find(t => t.id === p)).filter(p => !!p) as Tag[],
    ctx: { prev: null, next: null }
  };
}
