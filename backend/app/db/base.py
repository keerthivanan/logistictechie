# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.session import Base
from app.models.user import User
from app.models.quote import Quote
from app.models.booking import Booking
from app.models.activity import UserActivity
# Marketplace Expansion
from app.models.forwarder import Forwarder
from app.models.marketplace import MarketplaceRequest, MarketplaceBid
from app.models.task import Task
from app.models.n8n_logs import BroadcastLog, EventsLog, AnalyticsLog, RejectedAttempt
