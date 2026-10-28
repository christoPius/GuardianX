
from event_manager import create_event
from risk_engine import assess_risk
from incident_deduplicator import should_create_incident
from incident_manager import create_incident


def main():
    # 1. Create a synthetic line-crossing event
    event = create_event(
        event_type="line_crossing",
        track_id=7,
        confidence=0.82,
        direction="B -> A"
    )

    print("\n1. EVENT CREATED")
    print(event)

    # 2. Assess risk
    risk_result = assess_risk(event)

    print("\n2. RISK ASSESSMENT")
    print(risk_result)

    # 3. Check duplicate prevention
    accepted = should_create_incident(event)

    print("\n3. DUPLICATE PREVENTION")
    print("First event accepted:", accepted)

    # 4. Create incident if accepted
    if accepted:
        incident = create_incident(event, risk_result)

        print("\n4. INCIDENT CREATED")
        print(incident)

    # 5. Submit the same event again
    duplicate_accepted = should_create_incident(event)

    print("\n5. DUPLICATE TEST")
    print("Duplicate accepted:", duplicate_accepted)

    # 6. Validate expected behavior
    assert event["event_type"] == "line_crossing"
    assert risk_result["risk_score"] == 59.6
    assert risk_result["risk_level"] == "MEDIUM"
    assert accepted is True
    assert duplicate_accepted is False

    print("\nPASS: Event pipeline checks completed.")


if __name__ == "__main__":
    main()
