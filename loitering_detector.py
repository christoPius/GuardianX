LOITERING_THRESHOLD = 30

loiter_start_times = {}
loitering_triggered = {}

def check_loitering(track_id, inside, current_time):

    if inside == False:
        loitering_triggered.pop(track_id, None)
        loiter_start_times.pop(track_id, None)
    elif inside == True and track_id not in loiter_start_times:
        loiter_start_times[track_id] = current_time
        return None

    else:
        elapsed = current_time - loiter_start_times[track_id]
        if elapsed.total_seconds() >= LOITERING_THRESHOLD:
            if track_id not in loitering_triggered:
                loitering_triggered[track_id] = True
                return True
    print(
            "LOITER CHECK:",
            track_id,
            inside,
            current_time
        )  
    return None

from datetime import datetime, timedelta

start = datetime.now()

# print(check_loitering(7, True, start))                    # None
# print(check_loitering(7, True, start + timedelta(seconds=10)))  # None
# print(check_loitering(7, True, start + timedelta(seconds=29)))  # None
# print(check_loitering(7, True, start + timedelta(seconds=30)))  # True
# print(check_loitering(7, True, start + timedelta(seconds=31)))  # None

# print(check_loitering(7, False, start + timedelta(seconds=40))) # None

# print(check_loitering(7, True, start + timedelta(seconds=50)))  # None