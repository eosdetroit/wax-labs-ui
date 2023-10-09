from notifications.settings import Tables, cfg
from notifications.wax_interface.chain import get_table_rows
from notifications.wax_interface.queries import WaxObjectNotFound
from notifications.wax_interface.schemas.proposal import Proposal


async def get_proposal(proposal_id: int) -> Proposal | None:
    async for row in get_table_rows(
        code=cfg.wax_labs_contract_account,
        scope=cfg.wax_labs_contract_account,
        table=Tables.PROPOSALS,
        lower_bound=proposal_id,
        upper_bound=proposal_id,
        limit=1,
        full=True,
    ):
        if row:
            return Proposal.model_validate(row)

    raise WaxObjectNotFound()
