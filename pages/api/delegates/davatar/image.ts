import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const gatewayUrl = req.query.gatewayUrl as string;

  const fetched = await fetch(gatewayUrl);
  const json = await fetched.json();

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).json(json);
});
