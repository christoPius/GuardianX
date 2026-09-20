from datetime import datetime, timedelta

COOLDOWN_SECONDS = 30

last_incident_time = {}

def should_create_incident(event):
    track_id = event.get("track_id")
    event_type = event.get("event_type")
    key = (track_id, event_type)
    now = datetime.now()
    if key not in last_incident_time:
        last_incident_time[key] = now
        return True
    else:
        elapsed = now - last_incident_time[key]
        if elapsed < timedelta(seconds=COOLDOWN_SECONDS):
            return False
        else:
            last_incident_time[key] = now
            return True


if __name__ == "__main__":
    event1 = {
    "track_id": 7,
    "event_type": "line_crossing"
}

    event2 = {
        "track_id": 7,
        "event_type": "line_crossing"
    }

    event3 = {
        "track_id": 8,
        "event_type": "line_crossing"
    }

    event4 = {
        "track_id": 7,
        "event_type": "zone_entry"
    }

    print(should_create_incident(event1))
    print(should_create_incident(event2))
    print(should_create_incident(event3))
    print(should_create_incident(event4))