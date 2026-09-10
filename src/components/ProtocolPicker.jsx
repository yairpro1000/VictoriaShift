import { useId, useState } from 'react'

const CREATE_PROTOCOL = '__create_protocol__'

export function ProtocolPicker({ selectedProtocol, selectedProtocolId, protocols, onSelect, onCreate }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectId = useId()

  return (
    <div>
      <div className="protocol-heading">
        <h1>{selectedProtocol?.name ?? 'Select protocol'}</h1>
        <button
          type="button"
          className="protocol-change-button"
          onClick={() => setIsOpen((current) => !current)}
          aria-label="Change protocol"
          aria-expanded={isOpen}
          aria-controls={isOpen ? selectId : undefined}
        >
          ✎
        </button>
      </div>
      {isOpen ? (
        <select
          id={selectId}
          className="protocol-select"
          aria-label="Protocol"
          value={selectedProtocolId}
          onChange={(event) => {
            if (event.target.value === CREATE_PROTOCOL) {
              onCreate?.()
            } else {
              onSelect(event.target.value)
            }
            setIsOpen(false)
          }}
        >
          {!selectedProtocolId ? <option value="">Select protocol</option> : null}
          {protocols.map((protocol) => (
            <option key={protocol.id} value={protocol.id}>{protocol.name}</option>
          ))}
          {onCreate ? <option value={CREATE_PROTOCOL}>+ Create protocol</option> : null}
        </select>
      ) : null}
    </div>
  )
}
