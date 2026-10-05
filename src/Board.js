import React from 'react';
import Dragula from 'dragula';
import 'dragula/dist/dragula.css';
import Swimlane from './Swimlane';
import './Board.css';

export default class Board extends React.Component {
  constructor(props) {
    super(props);

    const savedClients = localStorage.getItem('shiptivitas-clients');

    const clients = savedClients
      ? JSON.parse(savedClients)
      : this.getClients();

    this.state = {
      clients: {
        backlog: clients.filter(
          client => !client.status || client.status === 'backlog'
        ),
        inProgress: clients.filter(
          client => client.status === 'in-progress'
        ),
        complete: clients.filter(
          client => client.status === 'complete'
        ),
      },
    };

    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef(),
    };

    this.originalSource = null;
    this.originalNextSibling = null;
  }

  componentDidMount() {
    this.drake = Dragula([
      this.swimlanes.backlog.current,
      this.swimlanes.inProgress.current,
      this.swimlanes.complete.current,
    ]);

    this.drake.on('drag', (el, source) => {
      this.originalSource = source;
      this.originalNextSibling = el.nextSibling;
    });

    this.drake.on('drop', (el, target, source, sibling) => {
      const id = el.dataset.id;

      let newStatus;

      if (target === this.swimlanes.backlog.current) {
        newStatus = 'backlog';
      } else if (target === this.swimlanes.inProgress.current) {
        newStatus = 'in-progress';
      } else {
        newStatus = 'complete';
      }

      // Find the position where the card was dropped
      const targetIndex = sibling
        ? Array.from(target.children).indexOf(sibling)
        : target.children.length - 1;

      // Restore DOM so React can safely update it
      if (
        this.originalNextSibling &&
        this.originalNextSibling.parentNode === this.originalSource
      ) {
        this.originalSource.insertBefore(
          el,
          this.originalNextSibling
        );
      } else {
        this.originalSource.appendChild(el);
      }

      this.setState(prevState => {
        const allClients = [
          ...prevState.clients.backlog,
          ...prevState.clients.inProgress,
          ...prevState.clients.complete,
        ];

        const movedClient = allClients.find(
          client => client.id === id
        );

        const remainingClients = allClients.filter(
          client => client.id !== id
        );

        const updatedClient = {
          ...movedClient,
          status: newStatus,
        };

        const targetClients = remainingClients.filter(
          client => client.status === newStatus
        );

        targetClients.splice(targetIndex, 0, updatedClient);

        return {
          clients: {
            backlog:
              newStatus === 'backlog'
                ? targetClients
                : remainingClients.filter(
                    client => client.status === 'backlog'
                  ),

            inProgress:
              newStatus === 'in-progress'
                ? targetClients
                : remainingClients.filter(
                    client => client.status === 'in-progress'
                  ),

            complete:
              newStatus === 'complete'
                ? targetClients
                : remainingClients.filter(
                    client => client.status === 'complete'
                  ),
          },
        };
      }, () => {
        const allClients = [
          ...this.state.clients.backlog,
          ...this.state.clients.inProgress,
          ...this.state.clients.complete,
        ];

        localStorage.setItem(
          'shiptivitas-clients',
          JSON.stringify(allClients)
        );
      });
    });
  }

  componentWillUnmount() {
    if (this.drake) {
      this.drake.destroy();
    }
  }

  getClients() {
    return [
      ['1','Stark, White and Abbott','Cloned Optimal Architecture', 'backlog'],
      ['2','Wiza LLC','Exclusive Bandwidth-Monitored Implementation', 'backlog'],
      ['3','Nolan LLC','Vision-Oriented 4Thgeneration Graphicaluserinterface', 'backlog'],
      ['4','Thompson PLC','Streamlined Regional Knowledgeuser', 'backlog'],
      ['5','Walker-Williamson','Team-Oriented 6Thgeneration Matrix', 'backlog'],
      ['6','Boehm and Sons','Automated Systematic Paradigm', 'backlog'],
      ['7','Runolfsson, Hegmann and Block','Integrated Transitional Strategy', 'backlog'],
      ['8','Schumm-Labadie','Operative Heuristic Challenge', 'backlog'],
      ['9','Kohler Group','Re-Contextualized Multi-Tasking Attitude', 'backlog'],
      ['10','Romaguera Inc','Managed Foreground Toolset', 'backlog'],
      ['11','Reilly-King','Future-Proofed Interactive Toolset', 'backlog'],
      ['12','Emard, Champlin and Runolfsdottir','Devolved Needs-Based Capability', 'backlog'],
      ['13','Fritsch, Cronin and Wolff','Open-Source 3Rdgeneration Website', 'backlog'],
      ['14','Borer LLC','Profit-Focused Incremental Orchestration', 'backlog'],
      ['15','Emmerich-Ankunding','User-Centric Stable Extranet', 'backlog'],
      ['16','Willms-Abbott','Progressive Bandwidth-Monitored Access', 'backlog'],
      ['17','Brekke PLC','Intuitive User-Facing Customerloyalty', 'backlog'],
      ['18','Bins, Toy and Klocko','Integrated Assymetric Software', 'backlog'],
      ['19','Hodkiewicz-Hayes','Programmable Systematic Securedline', 'backlog'],
      ['20','Murphy, Lang and Ferry','Organized Explicit Access', 'backlog'],
    ].map(companyDetails => ({
      id: companyDetails[0],
      name: companyDetails[1],
      description: companyDetails[2],
      status: companyDetails[3],
    }));
  }

  renderSwimlane(name, clients, ref) {
    return (
      <Swimlane
        name={name}
        clients={clients}
        dragulaRef={ref}
      />
    );
  }

  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">

            <div className="col-md-4">
              {this.renderSwimlane(
                'Backlog',
                this.state.clients.backlog,
                this.swimlanes.backlog
              )}
            </div>

            <div className="col-md-4">
              {this.renderSwimlane(
                'In Progress',
                this.state.clients.inProgress,
                this.swimlanes.inProgress
              )}
            </div>

            <div className="col-md-4">
              {this.renderSwimlane(
                'Complete',
                this.state.clients.complete,
                this.swimlanes.complete
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }
}