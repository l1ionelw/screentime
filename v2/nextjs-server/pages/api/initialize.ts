import {NextApiRequest, NextApiResponse} from "next";
export default function init(req: NextApiRequest, res: NextApiResponse) {
    return res.send("Initialized");
}