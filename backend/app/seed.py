from __future__ import annotations

from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from app.auth.security import hash_password
from app.db.database import SessionLocal
from app.models.activity import Activity
from app.models.blocker import Blocker
from app.models.milestone import Milestone
from app.models.project import Project
from app.models.release import Release
from app.models.risk import Risk
from app.models.task import Task
from app.models.user import User


def seed() -> None:
    db: Session = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        users = [
            User(name='Admin User', email='admin@techflow.dev', password_hash=hash_password('Admin@123'), role='ADMIN'),
            User(name='Program Manager', email='pm@techflow.dev', password_hash=hash_password('PM@123'), role='PROGRAM_MANAGER'),
            User(name='Engineer One', email='engineer1@techflow.dev', password_hash=hash_password('Engineer@123'), role='ENGINEER'),
            User(name='Engineer Two', email='engineer2@techflow.dev', password_hash=hash_password('Engineer@123'), role='ENGINEER'),
            User(name='Viewer User', email='viewer@techflow.dev', password_hash=hash_password('Viewer@123'), role='VIEWER'),
        ]
        db.add_all(users)
        db.commit()
        db.refresh(users[0])

        projects = [
            Project(name='Customer Portal Modernization', key='CPM', description='Portal migration', owner_id=users[1].id, status='IN_PROGRESS', priority='HIGH', start_date=date(2026, 8, 1), target_date=date(2026, 11, 20)),
            Project(name='Payment Platform Upgrade', key='PPU', description='Payments modernization', owner_id=users[1].id, status='AT_RISK', priority='CRITICAL', start_date=date(2026, 7, 15), target_date=date(2026, 10, 25)),
            Project(name='Mobile Application Release', key='MAR', description='Release prep', owner_id=users[2].id, status='BLOCKED', priority='HIGH', start_date=date(2026, 8, 10), target_date=date(2026, 11, 30)),
            Project(name='Data Platform Migration', key='DPM', description='Warehouse move', owner_id=users[3].id, status='PLANNING', priority='MEDIUM', start_date=date(2026, 9, 1), target_date=date(2026, 12, 15)),
            Project(name='Authentication Service Upgrade', key='ASU', description='Auth modernization', owner_id=users[1].id, status='COMPLETED', priority='MEDIUM', start_date=date(2026, 6, 1), target_date=date(2026, 9, 30)),
        ]
        db.add_all(projects)
        db.commit()

        tasks = [
            Task(project_id=projects[0].id, title='Design portal IA', description='Define IA', assignee_id=users[2].id, reporter_id=users[1].id, status='DONE', priority='HIGH', story_points=8, start_date=date(2026, 8, 2), due_date=date(2026, 8, 12), completed_at=datetime.now() - timedelta(days=10)),
            Task(project_id=projects[0].id, title='Implement API contract', description='Build REST contract', assignee_id=users[2].id, reporter_id=users[1].id, status='IN_PROGRESS', priority='HIGH', story_points=13, start_date=date(2026, 8, 15), due_date=date(2026, 9, 20)),
            Task(project_id=projects[1].id, title='Reconcile payment gateway', description='Manage gateway cutover', assignee_id=users[3].id, reporter_id=users[1].id, status='BLOCKED', priority='CRITICAL', story_points=21, start_date=date(2026, 8, 1), due_date=date(2026, 9, 15)),
            Task(project_id=projects[2].id, title='Publish release notes', description='Create notes', assignee_id=users[2].id, reporter_id=users[1].id, status='TODO', priority='MEDIUM', story_points=5, start_date=date(2026, 9, 3), due_date=date(2026, 9, 14)),
            Task(project_id=projects[4].id, title='Finalize auth migration', description='Finalize release', assignee_id=users[3].id, reporter_id=users[1].id, status='DONE', priority='MEDIUM', story_points=8, start_date=date(2026, 7, 10), due_date=date(2026, 8, 20), completed_at=datetime.now() - timedelta(days=20)),
        ]
        db.add_all(tasks)
        db.commit()

        milestones = [
            Milestone(project_id=projects[0].id, name='Portal design approval', description='Approval gate', target_date=date(2026, 9, 15), status='COMPLETED', owner_id=users[1].id, completion_percentage=100),
            Milestone(project_id=projects[1].id, name='Payment cutover rehearsal', description='Cutover rehearsal', target_date=date(2026, 10, 5), status='AT_RISK', owner_id=users[1].id, completion_percentage=55),
            Milestone(project_id=projects[2].id, name='Storefront freeze', description='Freeze storefront', target_date=date(2026, 10, 22), status='NOT_STARTED', owner_id=users[2].id, completion_percentage=0),
        ]
        db.add_all(milestones)
        db.commit()

        risks = [
            Risk(project_id=projects[1].id, title='Payment batch outage', description='Risk of outage during settlement', category='Infrastructure', probability=4, impact=4, severity='HIGH', owner_id=users[3].id, mitigation_plan='Prepare failover plan', contingency_plan='Revert to legacy batch', status='OPEN', due_date=date(2026, 10, 10)),
            Risk(project_id=projects[2].id, title='Identity token expiry', description='Expired token behavior', category='Security', probability=5, impact=5, severity='CRITICAL', owner_id=users[2].id, mitigation_plan='Shorten token window', contingency_plan='Manual token refresh', status='OPEN', due_date=date(2026, 9, 25)),
            Risk(project_id=projects[3].id, title='Schema drift risk', description='Incoming schema mismatch', category='Data', probability=2, impact=3, severity='MEDIUM', owner_id=users[3].id, mitigation_plan='Contract test suite', contingency_plan='Shadow validation', status='MITIGATING', due_date=date(2026, 11, 8)),
        ]
        db.add_all(risks)
        db.commit()

        blockers = [
            Blocker(project_id=projects[1].id, task_id=tasks[2].id, title='Vault API access', description='Access to vault API still pending', owner_id=users[3].id, severity='CRITICAL', status='OPEN', identified_at=datetime.now() - timedelta(days=4), target_resolution_date=date(2026, 9, 20)),
            Blocker(project_id=projects[2].id, task_id=tasks[3].id, title='Legacy parity gap', description='Legacy event parity mismatch', owner_id=users[2].id, severity='HIGH', status='OPEN', identified_at=datetime.now() - timedelta(days=2), target_resolution_date=date(2026, 9, 12)),
        ]
        db.add_all(blockers)
        db.commit()

        releases = [
            Release(project_id=projects[0].id, version='2.6.0', name='Portal Launch', description='Customer portal launch', planned_date=date(2026, 11, 14), actual_date=None, status='READY_FOR_RELEASE', release_owner_id=users[1].id, environment='STAGING'),
            Release(project_id=projects[1].id, version='3.1.0', name='Payment Platform', description='Payment platform release', planned_date=date(2026, 11, 11), actual_date=None, status='DEVELOPMENT', release_owner_id=users[1].id, environment='QA'),
            Release(project_id=projects[4].id, version='1.9.0', name='Auth Service', description='Identity release', planned_date=date(2026, 9, 17), actual_date=date(2026, 9, 18), status='RELEASED', release_owner_id=users[1].id, environment='PRODUCTION'),
        ]
        db.add_all(releases)
        db.commit()

        activities = [
            Activity(user_id=users[1].id, project_id=projects[0].id, entity_type='project', entity_id=projects[0].id, action='Project created', details='Portal modernization kicked off'),
            Activity(user_id=users[2].id, project_id=projects[1].id, entity_type='task', entity_id=tasks[2].id, action='Task status changed', details='BLOCKED'),
            Activity(user_id=users[1].id, project_id=projects[4].id, entity_type='release', entity_id=releases[2].id, action='Release deployed', details='Production release'),
        ]
        db.add_all(activities)
        db.commit()
    finally:
        db.close()


if __name__ == '__main__':
    seed()
