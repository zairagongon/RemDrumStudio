const coachService = require('../../services/admin/coachService');
const overviewService = require('../../services/admin/overviewService');

const wrap = fn => async (req, res, next) => {
  try { res.json({ success: true, ...(await fn(req)) }); } catch (err) { next(err); }
};

exports.listCoaches = wrap(async () => ({ coaches: await coachService.list() }));
exports.createCoach = async (req, res, next) => {
  try { res.status(201).json({ success: true, ...(await coachService.create(req.body)) }); } catch (err) { next(err); }
};
exports.resendInvite = wrap(req => coachService.resendInvite(Number(req.params.id)));
exports.updateCoach = wrap(async req => ({ coach: await coachService.update(Number(req.params.id), req.body) }));
exports.overview = wrap(() => overviewService.get());
