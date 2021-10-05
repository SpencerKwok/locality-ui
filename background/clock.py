from apscheduler.schedulers.blocking import BlockingScheduler

sched = BlockingScheduler()

@sched.scheduled_job('interval', seconds=1)
def timed_job():
    print('This job is run every second.')

sched.start()
