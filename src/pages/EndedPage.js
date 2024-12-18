import React from 'react';

function EndedPage() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h1 className="card-title text-center mb-4">
                Welcome to the Peer Review Site for ETR 500
              </h1>
              <p className="lead text-left mb-4">
                ETR-500 is a team based class. Each team member is responsible
                for evaluating their own performance and contribution to the
                team projects, and the performance of team members on their
                team.
              </p>
              <p className="text-center text-muted">
                  <b>
                      The Peer Review Period Has Ended. Please contract the instructor for further information.
                  </b>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EndedPage;
