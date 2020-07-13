import { PanelProps } from '@grafana/data';
import { stylesFactory, useTheme } from '@grafana/ui';
import './style.css'
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import _ from 'lodash';
import React from 'react';
import { SimpleOptions } from 'types';

interface Props extends PanelProps<SimpleOptions> { }

const getStyles = stylesFactory(() => {
  return {
    root: {
      backgroundColor: 'red',
      height: '100%',
      width: '100%',
    }
  }
})

export const SimplePanel: React.FC<Props> = (props) => {
  const { options, data, fieldConfig } = props
  const theme = useTheme();
  const styles = getStyles();

  // moving the row data to a cleaner hirarchy and converting the buffer to an array.
  let maxIndex = 0;
  let rowData = {};
  data.series[0].fields.forEach(field => {
    rowData[field.name] = field.values.toArray();
    if (rowData[field.name].length > maxIndex) {
      maxIndex = rowData[field.name].length;
    }
  })

  const API_URL = fieldConfig.defaults.custom.update_api;

  // Dynamically defining the column defenitions
  
  const shouldEnableFeature = (columnName, flag) => {
    const override = _.find(fieldConfig.overrides, (f) => f.matcher.options === columnName);
    if (!override) {
      return fieldConfig.defaults.custom[flag] === true;
    }
    const property = _.find(override.properties, (o) => o.id === `custom.${flag}`);
    if (!property) {
      return fieldConfig.defaults.custom[flag] === true;
    }
    else {
      return property.value === true;
    }
  }

  const onCellEditCallback = (params) => {
    let colId = params.column.getId();
    console.log(API_URL)
    fetch(API_URL, {
      method: "put",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        id: params.data.id,
        statusCode: params.data.statusCode
      })
    }).catch(e => console.error(e));
  }

  const onExcelExport = () => {
    const params = {
      sheetName: 'grafana_export'
    }

    gridOptions.api.exportDataAsExcel(params);

  }
  
  const columnDefs = Object.keys(rowData).map(field => {
    return {
      field,
      resizable: true,
      filter: true,
      editable: shouldEnableFeature(field, 'editable'),
      sortable: true,
      menuTabs: ['filterMenuTab'],
      singleClickEdit: true
    };
  })

  // TODO: add scrolling
  let formattedRowData = [];
  let index = 0;
  while (index < maxIndex) {
    let row = {};
    Object.keys(rowData).forEach(field => {
      row[field] = rowData[field][index];
    });
    formattedRowData.push(row);
    index++
  }

  var gridOptions = {
    columnDefs: columnDefs,
    rowData: formattedRowData,
    defaultColDef: {
      flex: 1
    },
    suppressDragLeaveHidesColumns: true,
    onCellValueChanged: onCellEditCallback,
  };

  gridOptions.rowStyle = { background: '#2D3F42', color: '#ddd'};

  return (
    <div style={{height: '100%', width: '100%', display: 'flex', flexDirection: 'column'}}>
      <div className={"ag-theme-alpine"} style={{ height: '100%', width: '100%' , flexGrow: '1'}} >
        <AgGridReact gridOptions={gridOptions}>

        </AgGridReact>
      </div >
      <button className='pulse' onClick={onExcelExport} style={{ height: '10%', width: '10%', zIndex: 1000, alignSelf: 'center', marginTop: '2%'}}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%"><path fill="#4CAF50" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"/><path fill="#FFF" d="M32 15H39V18H32zM32 25H39V28H32zM32 30H39V33H32zM32 20H39V23H32zM25 15H30V18H25zM25 25H30V28H25zM25 30H30V33H25zM25 20H30V23H25z"/><path fill="#2E7D32" d="M27 42L6 38 6 10 27 6z"/><path fill="#FFF" d="M19.129,31l-2.411-4.561c-0.092-0.171-0.186-0.483-0.284-0.938h-0.037c-0.046,0.215-0.154,0.541-0.324,0.979L13.652,31H9.895l4.462-7.001L10.274,17h3.837l2.001,4.196c0.156,0.331,0.296,0.725,0.42,1.179h0.04c0.078-0.271,0.224-0.68,0.439-1.22L19.237,17h3.515l-4.199,6.939l4.316,7.059h-3.74V31z"/></svg>
        </button>
    </div>
  );
};
