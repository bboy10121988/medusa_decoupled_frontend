const Radio = ({ checked, 'data-testid': dataTestId }: { checked: boolean, 'data-testid'?: string }) => {
  return (
    <>
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        className="group relative flex h-5 w-5 items-center justify-center outline-none"
        data-testid={dataTestId || 'radio-button'}
      >
        <div className={`
          flex h-[14px] w-[14px] items-center justify-center rounded-full border-2 transition-all
          ${checked 
            ? 'bg-blue-500 border-blue-500' 
            : 'bg-white border-gray-300 hover:border-gray-400'
          }
        `}>
          {checked && (
            <div className="bg-white rounded-full h-1.5 w-1.5"></div>
          )}
        </div>
      </button>
    </>
  )
}

export default Radio
