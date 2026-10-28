from datetime import datetime

def create_event(
        event_type,
        track_id,
        confidence = None,
        zone = None,
        direction = None
):
    event = {
        "event_type": event_type,
        "track_id" : track_id,
        "timestamp" : datetime.now().isoformat(),
        "confidence": confidence,
        "zone": zone,
        "direction": direction
    }

    
    return event

if __name__ == "__main__":
    event = create_event(
        event_type="line_crossing",
        track_id=7,
        confidence=0.87,
        direction="A -> B"
    )

    print(event)