import React, { useEffect, useState } from 'react';

export default function HomePage() {


  return (
    <div className="text-center">
        <h1 className="display-4">Welcome</h1>
        <p>This is where summary tables, and standings will go!</p>

        <div className="parent">
            <div className="child-top">
                <p>Points Breakdown for the different scoring areas</p>
            </div>
            <div className="child-top">
                <table role="table">
                    <thead>
                        <tr role="row">
                            <th colSpan="1" role="columnheader" title="Toggle SortBy" style={{ cursor: 'pointer' }}>Position</th>
                            <th colSpan="1" role="columnheader" title="Toggle SortBy" style={{ cursor: 'pointer' }}>Team</th>
                        </tr>
				</thead>
				<tbody role="rowgroup">
					<tr role="row">
						<td role="cell">1</td>
						<td role="cell">Michelle</td>
					</tr>
					<tr role="row">
						<td role="cell">2</td>
						<td role="cell">Josh</td>
					</tr>
					<tr role="row">
						<td role="cell">3</td>
						<td role="cell">Brady</td>
					</tr>
					<tr role="row">
						<td role="cell">4</td>
						<td role="cell">Fred</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
  );
}